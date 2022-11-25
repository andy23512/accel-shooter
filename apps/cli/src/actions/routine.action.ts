import childProcess from 'child_process';
import { format, parse } from 'date-fns';
import fs from 'fs';
import inquirer from 'inquirer';
import puppeteer from 'puppeteer';

import { CONFIG, sleep } from '@accel-shooter/node-shared';

import { Holiday } from '../classes/holiday.class';
import { dailyProgressAction } from './daily-progress.action';
import { dumpMyTasksAction } from './dump-my-tasks.action';

export async function routineAction() {
  const ITEMS = [
    {
      name: 'Punch',
      type: 'input',
      async validate(input: string) {
        if (input) {
          const result = await punch();
          console.log(result);
          return true;
        } else {
          process.exit();
        }
      },
    },
    {
      name: 'isa',
      type: 'confirm',
      morningOnly: true,
    },
    {
      name: 'dump my tasks',
      type: 'input',
      morningOnly: true,
      async validate(input: string) {
        if (input) {
          await dumpMyTasksAction();
          return true;
        } else {
          process.exit();
        }
      },
    },
    {
      name: 'check tasks',
      type: 'confirm',
      morningOnly: true,
    },
    {
      name: 'check todo',
      type: 'confirm',
      morningOnly: true,
    },
    {
      name: 'daily progress',
      type: 'input',
      morningOnly: true,
      async validate(input: string) {
        if (input) {
          await dailyProgressAction();
          return true;
        } else {
          process.exit();
        }
      },
    },
    {
      name: 'send dp to slack',
      type: 'confirm',
      morningOnly: true,
    },
    {
      name: 'topgrade',
      type: 'confirm',
      morningOnly: true,
    },
  ];
  const today = new Date();
  const hour = today.getHours();
  const items =
    hour > 12 ? ITEMS.filter(({ morningOnly }) => !morningOnly) : ITEMS;
  const day =
    process.argv.length >= 4
      ? parse(process.argv[3], 'yyyy/MM/dd', today)
      : today;
  const holiday = new Holiday();
  const isWorkDay = holiday.checkIsWorkday(format(day, 'yyyy/M/d'));
  if (!isWorkDay) {
    const message = 'Today is holiday!';
    console.log(message);
    childProcess.execSync(
      `osascript -e 'display notification "${message
        .replace(/"/g, '')
        .replace(/'/g, '')}" with title "Accel Shooter"'`
    );
    return;
  }
  console.log('Today is workday!');
  await inquirer.prompt(items);
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
