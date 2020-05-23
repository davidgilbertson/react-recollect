import assert from 'assert';
import playwright from 'playwright';

const test = async (name, func) => {
  const runTestWithBrowser = async (browserName) => {
    const browser = await playwright[browserName].launch({ headless: true });
    const page = await browser.newPage();

    try {
      await func(page);
    } catch (err) {
      console.error(browserName, name, err);
    }

    await browser.close();
  };

  ['chromium', 'firefox', 'webkit'].forEach(runTestWithBrowser);
};

const task1Name = 'delectus aut autem';
const task2Name = 'quis ut nam facilis et officia qui';
const task3Name = 'fugiat veniam minus';
const task4Name = 'et porro tempora';
const task5Name =
  'laboriosam mollitia et enim quasi adipisci quia provident illum';

test('Todo MVC tab', async (page) => {
  await page.goto('http://localhost:3000/');

  await page.click('text=todo mvc');

  const title = await page.$eval('text=todos', (el) => el.textContent);
  assert.strictEqual(title, 'todos');

  await page.waitForSelector('text=completed');
  const todos = await page.$$eval('.todo-list .view', (els) =>
    Array.from(els).map((el) => el.textContent)
  );

  assert.deepStrictEqual(todos, [
    task1Name,
    task2Name,
    task3Name,
    task4Name,
    task5Name,
  ]);

  await page.click('text=Active');
});
