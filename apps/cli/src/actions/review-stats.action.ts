import {
  ClickUp,
  ClickUpUser,
  CONFIG,
  GitLab,
} from '@accel-shooter/node-shared';
import { Action } from '../classes/action.class';

export class ReviewStatsAction extends Action {
  public command = 'reviewStats';
  public description = 'review tasks stats of frontend members';
  public alias = 'rs';

  public async run() {
    const me = (await ClickUp.getCurrentUser()).user;
    const frontendGroupMembers = (
      await ClickUp.getFrontendGroupMembers()
    ).filter((m) => m.id !== me.id);
    const team = (await ClickUp.getTeams()).teams.find(
      (t) => t.name === CONFIG.ClickUpTeam
    );
    const membersWithCount: {
      member: ClickUpUser;
      clickUpCount: number;
      gitLabCount: number;
    }[] = [];
    for (const member of frontendGroupMembers) {
      const tasks = (await ClickUp.getMyTasks(team.id, member.id)).tasks;
      const gitLabUserId = CONFIG.UserIdList.find(
        (item) => item.clickUpUserId === member.id
      ).gitLabUserId;
      const mergeRequests = (
        await GitLab.getReadyToReviewMergeRequestsByReviewer(gitLabUserId)
      ).filter((m) => m.merge_status === 'can_be_merged');
      let gitLabCount = 0;
      for (const mergeRequest of mergeRequests) {
        const approval = await GitLab.getMergeRequestApprovals(
          mergeRequest.project_id,
          mergeRequest.iid
        );
        if (!approval.approved_by.some((a) => a.user.id === gitLabUserId)) {
          gitLabCount += 1;
        }
      }
      membersWithCount.push({
        member,
        clickUpCount: tasks.filter((t) => t.name === 'Code Review').length,
        gitLabCount,
      });
    }
    console.log(
      membersWithCount.map(
        (m) => `${m.member.username}: ${m.gitLabCount}, ${m.clickUpCount}`
      )
    );
  }
}
