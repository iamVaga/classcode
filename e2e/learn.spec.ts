import AxeBuilder from '@axe-core/playwright';
import {expect, test} from '@playwright/test';

test('a learner edits a value, predicts a step, then proves and recalls the idea', async ({page}) => {
  await page.goto('/learn');
  await page.getByRole('link', {name: 'Visual Lab'}).click();
  await expect(page.getByRole('heading', {name: 'Copying a value'})).toBeVisible();
  await page.getByLabel('Starting value').fill('12');
  await page.getByLabel('New value').fill('-7');
  await page.getByRole('button', {name: 'Apply input'}).click();
  await expect(page.getByLabel('Two names, example code')).toContainText('original = 12');

  await page.getByLabel('Predict First').check();
  const scrubber = page.getByRole('slider', {name: 'Timeline step'});
  await scrubber.focus();
  await scrubber.press('End');
  await expect(scrubber).toHaveAttribute('aria-valuetext', 'Step 3 of 5');
  await page.getByRole('radio', {name: 'It keeps its value'}).check();
  await page.getByRole('button', {name: 'Reveal next step'}).click();
  await expect(page.getByRole('status').filter({hasText: 'Your prediction matches.'})).toContainText('still refers to 12');
  await page.getByRole('button', {name: 'Next step'}).click();
  await expect(page.getByRole('status').filter({hasText: 'Output'})).toContainText('12');

  await page.getByRole('radio', {name: '7', exact: true}).check();
  await page.getByRole('button', {name: 'Check answer'}).click();
  await expect(page.getByRole('status').filter({hasText: 'That’s right.'})).toContainText('B still refers to 7');
  await page.getByText('What is a name binding?', {exact: true}).click();
  await expect(page.getByText('A connection between a name and the object it currently refers to.')).toBeVisible();
});

test('array input errors leave the visual intact and playback can pause and restart', async ({page}) => {
  await page.goto('/learn/visuals?topic=insertion-sort');
  const values = page.getByRole('textbox', {name: 'Array values', exact: true});
  const error = page.locator('.learn').getByRole('alert');
  await values.fill('5,,1');
  await page.getByRole('button', {name: 'Apply input'}).click();
  await expect(error).toContainText('whole numbers');
  await expect(page.getByRole('slider')).toHaveValue('0');

  await values.fill('4, -3, 4');
  await page.getByRole('button', {name: 'Apply input'}).click();
  await expect(error).toHaveCount(0);
  await page.getByRole('button', {name: 'Play', exact: true}).click();
  await page.getByRole('button', {name: 'Pause', exact: true}).click();
  await expect(page.getByRole('button', {name: 'Play', exact: true})).toBeVisible();
  const speed = page.getByRole('combobox', {name: 'Speed', exact: true});
  await speed.selectOption('2');
  await page.getByRole('button', {name: 'Play', exact: true}).click();
  await expect(page.getByRole('status').filter({hasText: 'Output'})).toContainText('[-3,4,4]', {timeout: 9000});
  await page.getByRole('button', {name: 'Back', exact: true}).click();
  await expect(page.getByRole('status').filter({hasText: 'Output'})).toHaveCount(0);
  await page.getByRole('button', {name: 'Reset', exact: true}).click();
  await expect(page.getByRole('slider')).toHaveValue('0');
  await expect(speed).toHaveValue('2');
});

test('call stack and buddy customization remain usable with keyboard and reduced motion', async ({page}) => {
  await page.emulateMedia({reducedMotion: 'reduce'});
  await page.goto('/learn/visuals?topic=function-frames');
  const next = page.getByRole('button', {name: 'Next step'});
  await next.focus();
  await page.keyboard.press('Enter');
  const stack = page.getByRole('list', {name: 'Call stack, active frame first'});
  await expect(stack.getByRole('listitem').first()).toContainText('add');
  await expect(stack.getByRole('listitem').last()).toContainText('Waiting');
  await next.click();
  await next.click();
  await expect(stack.getByRole('listitem')).toHaveCount(1);
  await expect(stack).toContainText('result');

  await page.getByRole('button', {name: 'Customize buddy'}).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('button', {name: 'Nova the Astronaut'}).click();
  await page.getByRole('button', {name: 'Use this buddy'}).click();
  await expect(page.getByRole('img', {name: 'Nova the Astronaut'})).toBeVisible();
  await page.reload();
  await expect(page.getByRole('img', {name: 'Nova the Astronaut'})).toBeVisible();
});

for (const theme of ['dark', 'light']) {
  test(`Visual Lab fits 320px and passes axe in ${theme} mode`, async ({page}) => {
    await page.setViewportSize({width: 320, height: 760});
    await page.addInitScript(theme => localStorage.setItem('classcode-theme', theme), theme);
    await page.goto('/learn/visuals?topic=insertion-sort');
    await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
    await page.getByRole('textbox', {name: 'Array values', exact: true}).fill('-99, -18, 3, 2, 95, -25, 0, 99');
    await page.getByRole('button', {name: 'Apply input'}).click();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(320);
    const result = await new AxeBuilder({page}).include('.learn').withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
    expect(result.violations.map(item => ({id: item.id, nodes: item.nodes.map(node => node.target)}))).toEqual([]);
  });
}
