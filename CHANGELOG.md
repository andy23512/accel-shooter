# Change Log

## Template

```
## [Unrealased] - yyyy-mm-dd

### Added
### Changed
### Fixed

```
## [3.0.1] - 2021-08-28

### Fixed

- Fix extension not work bug

## [3.0.0] - 2021-08-28

### Added

- Add extension
- Open link in same group

## [2.0.5] - 2021-08-28

### Changed

- Start command is limited to tasks assigned to current user

## [2.0.4] - 2021-08-15

### Fixed

- Fix command cannot execute bug

## [2.0.3] - 2021-08-15

### Fixed

- fix postinstall command

## [2.0.2] - 2021-08-15

### Fixed

- fix postinstall command


## [2.0.1] - 2021-08-15

### Changed

- clean unneed files


## [2.0.0] - 2021-08-15

### Changed

- use nx structure

## [1.48.0] - 2021-08-14

### Changed

- open merge request page when start sync

## [1.47.1] - 2021-08-12

### Fixed

- Fix some check item missing bug

## [1.47.0] - 2021-08-11

### Added

- Ensure single instance for tracker

### Changed

- Check folder clean after selecting project

## [1.46.0] - 2021-08-06

### Changed

- Change dp format

## [1.45.0] - 2021-08-06

### Changed

- Remove action alias
- Set project check command at config

## [1.44.0] - 2021-08-06

### Added

- Add time command

### Changed

- Change copy action to update

## [1.43.3] - 2021-07-29

### Fixed

- Update deploy job name

## [1.43.2] - 2021-07-28

### Fixed

- Fix project todo not show bug

## [1.43.1] - 2021-07-19

### Fixed

- Fix cannot close closed or verified items bug

## [1.43.0] - 2021-07-19

### Added

- Clean closed and verified items

## [1.42.1] - 2021-07-15

### Fixed

- open is not defined

## [1.42.0] - 2021-07-12

### Added

- Add toDo command

## [1.41.0] - 2021-07-07

### Added

- Support project-dependent todo item

### Changed

- Set max worker number of jest checker command to 4

### Fixed

- Stop process of end action when task is uncompleted

## [1.40.0] - 2021-07-03

### Added

- Check MR is merged or not before sync

## [1.39.2] - 2021-07-01

### Fixed

- Fix progress bar bug

## [1.39.1] - 2021-07-01

### Fixed

- Fix branch equality bug

## [1.39.0] - 2021-07-01

### Changed

- Check branch not equal then checkout

## [1.38.0] - 2021-06-30

### Changed

- Show project name and issue number when sync
- Use different check item set when in different type of project
- Check working space in start and sync

## [1.37.0] - 2021-06-24

### Added

- Open frame url when start sync

## [1.36.1] - 2021-06-24

### Fixed

- Fix select mode in check command bug

## [1.36.0] - 2021-06-21

### Added

- Add progress bar to my task command

### Changed

- Directly execute end action when e is pressed in sync

## [1.35.0] - 2021-06-21

### Added

- Add task url in my task output

## [1.34.1] - 2021-06-20

### Fixed

- Retry when 4xx error happened
- fix mytask list table bug

## [1.34.0] - 2021-06-19

### Added

- Add select feature in check command

## [1.33.0] - 2021-06-19

### Change

- Run sync after start

## [1.32.3] - 2021-06-11

### Fixed

- Fix fetch not found bug

## [1.32.2] - 2021-06-11

### Fixed

- Fix file not found bug

## [1.32.1] - 2021-06-11

### Fixed

- Fix circular import bug

## [1.32.0] - 2021-06-11

### Added

- Add list command

### Changed

- Show whole path title in myTasks command
- Split actions into files

### Fixed

- Fix comment command bug

## [1.31.3] - 2021-06-10

### Fixed

- Ignore removed line when check word contain

## [1.31.2] - 2021-06-10

### Changed

- Remove sync after start feature

## [1.31.1] - 2021-06-09

### Fixed

- Fix bug in check item filter

## [1.31.0] - 2021-06-08

### Added

- Add ignore check item config
- Add comment command

### Changed

- Run sync after start
- Auto get gitlab project and issue number from path and branch name
- Add ###### in each item output start
- Remove passed result in frontend test output

## [1.30.1] - 2021-06-07

### Fixed

- Fix up copy not update status bug

## [1.30.0] - 2021-06-06

### Added

- Add my tasks command

## [1.29.1] - 2021-06-04

### Fixed

- Remove verified status item in track list

## [1.29.0] - 2021-06-04

### Added

- Add check for migration conflict

## [1.28.0] - 2021-06-03

### Changed

- Let check command output log file

## [1.27.1] - 2021-06-03

### Fixed

- Check only ts file and cross lib import in long path check

## [1.27.0] - 2021-06-03

### Added

- Add check test unittest check item

## [1.26.0] - 2021-06-03

### Added

- Support list based staging status

## [1.25.0] - 2021-06-03

### Changed

- Use new check

## [1.24.1] - 2021-06-02

### Fixed

- Remove additional symbol in branch name

## [1.24.0] - 2021-06-01

### Changed

- Show gitlab project name in dp
- Reduce start command output
- Do submodule update in start command

## [1.23.0] - 2021-06-01

### Changed

- Reduce branch name

## [1.22.2] - 2021-05-31

### Changed

- Remove additional output from commands

## [1.22.1] - 2021-05-31

### Fixed

- Fix sync progress not work bug

## [1.22.0] - 2021-05-30

### Added

- Implement slow version check command

### Changed

- Add progress for other command

## [1.21.0] - 2021-05-28

### Changed

- Add log for start command

## [1.20.0] - 2021-05-28

### Changed

- Check out branch when execute sync

## [1.19.0] - 2021-05-27

### Changed

- Remove gitlab label choice

## [1.18.0] - 2021-05-27

### Added

- Add webpage alias

## [1.17.0] - 2021-05-21

### Added

- Add RTVTasks command

## [1.16.0] - 2021-05-21

### Added

- Add conditional status feature

### Changed

- update track command to track new

## [1.15.1] - 2021-04-07

### Changed

- Update deploy job name

## [1.15.0] - 2021-03-25

### Added

- Add cross checklist command

## [1.14.0] - 2021-02-24

### Added

- Add completion check in end command

## [1.13.1] - 2021-02-24

### Fixed

- Fix revertEnd not revert assignee bug

## [1.13.0] - 2021-02-22

### Added

- Add console info when track task start

## [1.12.0] - 2021-02-22

### Added

- Add trackNew command

## [1.11.0] - 2021-01-28

### Changed

- Show error url in console
- Change execution order in start command

## [1.10.0] - 2021-01-26

### Added

- Add revert end command

### Changed

- Open clickup task page when start sync

## [1.9.0] - 2021-01-06

### Added

- Add retry to api request
- Search for deploy job in all pipelines
- Add ending hot key for sync command

### Changed

- Use cross platform notifier

## [1.8.0] - 2021-01-05

### Added

- Can comment out track item
- Add interval config

### Changed

- Remove confirm

## [1.7.0] - 2021-01-03

### Added

- Update task status in dp when copy
- Add check clickup task list and tag confirm

### Changed

### Fixed

- Fix Pipeline type not found bug
- Remove unused gitlab method

## [1.6.0] - 2020-12-31

### Changed

- Show pipeline failed message in tracker

## [1.5.0] - 2020-12-31

### Changed

- Move todoConfigChoices to config file
- Use environment variable to set config file path

## [1.4.0] - 2020-12-30

### Added

- Add output message for end command

### Changed

- Do not open issue page when start
- Change notification message of tracker
- Add "debug" choice to todoConfig

## [1.3.0] - 2020-12-30

### Fixed

- Use commit hash and branch ref to search pipeline to avoid cannot get correct pipeline bug

## [1.2.0] - 2020-12-28

### Added

- Use template to manage todo list

## [1.1.0] - 2020-12-28

### Added

- Remove item when track task is finished
- Use deploy job status to check deploy stage is finished

## [1.0.0] - 2020-12-23

### Added

- Init project
