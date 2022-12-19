import fs from 'fs';
import puppeteer from 'puppeteer';

import { CONFIG, sleep } from '@accel-shooter/node-shared';

import readline from 'readline';
import { Holiday } from '../classes/holiday.class';
import { getDayFromArgv } from '../utils';
import { dailyProgressAction } from './daily-progress.action';
import { dumpMyTasksAction } from './dump-my-tasks.action';

export function confirm(question: string) {
  return new Promise<void>((resolve, reject) => {
    const prompt = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    prompt.question(question + ' (y/n) ', function (answer) {
      if (answer === 'y' || answer === 'Y') {
        prompt.close();
        resolve();
      } else {
        reject();
      }
    });
  });
}

export async function routineAction() {
  const day = getDayFromArgv();
  const hour = day.getHours();
  const isMorning = hour < 12;
  const holiday = new Holiday();
  const isWorkDay = holiday.checkIsWorkday(day);
  const message = isWorkDay ? 'Today is workday!' : 'Today is holiday!';
  console.log(message);
  if (isWorkDay) {
    await confirm('run punch?');
    const result = await punch();
    console.log(result);
  }
  if (isMorning) {
    if (isWorkDay) {
      await confirm('isa done?');
      await confirm('run dump my tasks?');
      await dumpMyTasksAction();
      await confirm('check tasks done?');
      await confirm('check todo done?');
      await confirm('run daily progress?');
      await dailyProgressAction();
      await confirm('send dp to slack done?');
    }
  }
  console.log('Complete');
}

export async function punch() {
  const { account, password, url } = JSON.parse(
    fs.readFileSync(CONFIG.PunchInfoFile, { encoding: 'utf-8' })
  );
  const browser = await puppeteer.launch({
    headless: false,
  });
  const page = await browser.newPage();
  await page.goto(url);
  await page.evaluate(
    (a: string, p: string) => {
      const userName =
        document.querySelector<HTMLInputElement>('#user_username');
      if (userName) {
        userName.value = a;
      }
      const userPassword =
        document.querySelector<HTMLInputElement>('#user_passwd');
      if (userPassword) {
        userPassword.value = p;
      }
      const button = document.querySelector<HTMLAnchorElement>('#s_buttom');
      if (button) {
        button.click();
      }
    },
    account,
    password
  );
  await page.waitForNavigation();
  const hour = new Date().getHours();
  await page.evaluate((h) => {
    const punchInputs =
      document.querySelectorAll<HTMLInputElement>('.clock_enabled');
    const punchTimes = document.querySelectorAll<HTMLTableCellElement>(
      '#clock_listing td:nth-child(2)'
    );
    if (!punchTimes[0].textContent || !punchTimes[1].textContent) {
      return;
    }
    const start = punchTimes[0].textContent.replace(/[\s\n]/g, '');
    const end = punchTimes[1].textContent.replace(/[\s\n]/g, '');
    if (h > 7 && h < 11 && start === '') {
      punchInputs[0].click();
    } else if (h > 16 && h < 20 && end === '') {
      punchInputs[1].click();
    }
  }, hour);
  await page.waitForFunction(
    (h: number) => {
      const punchTimes = document.querySelectorAll<HTMLTableCellElement>(
        '#clock_listing td:nth-child(2)'
      );
      if (!punchTimes[0].textContent || !punchTimes[1].textContent) {
        return;
      }
      const start = punchTimes[0].textContent.replace(/[\s\n]/g, '');
      const end = punchTimes[1].textContent.replace(/[\s\n]/g, '');
      if (h > 7 && h < 11) {
        return start !== '';
      } else if (h > 16 && h < 20) {
        return end !== '';
      }
    },
    {},
    hour
  );
  const result = await page.evaluate(() => {
    const punchTimes = document.querySelectorAll<HTMLTableCellElement>(
      '#clock_listing td:nth-child(2)'
    );
    if (!punchTimes[0].textContent || !punchTimes[1].textContent) {
      return;
    }
    const start = punchTimes[0].textContent.replace(/[\s\n]/g, '');
    const end = punchTimes[1].textContent.replace(/[\s\n]/g, '');
    return [start, end];
  });
  await sleep(3000);
  await browser.close();
  return result;
}
