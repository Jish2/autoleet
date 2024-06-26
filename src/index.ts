import puppeteer from "puppeteer";
import { LEETCODE_URL, getDailyProblem } from "./utils/leetcode";
import dotenv from "dotenv";
import { getSolution } from "./utils/solutions";

dotenv.config();

const GITHUB_USERNAME = process.env.GITHUB_USERNAME;
const GITHUB_PASSWORD = process.env.GITHUB_PASSWORD;

if (!GITHUB_USERNAME || !GITHUB_PASSWORD) throw new Error("Please provide GITHUB_USERNAME and GITHUB_PASSWORD in .env file");

(async () => {
	const dailyProblem = await getDailyProblem();
	if (Object.values(dailyProblem).some((field) => !field)) throw new Error("Could not get daily problem " + JSON.stringify(dailyProblem));

	const solution = await getSolution(dailyProblem.questionId);
	if (!solution) throw new Error("No solution found");

	const browser = await puppeteer.launch({ headless: false });
	const page = await browser.newPage();

	await page.setViewport({ width: 1080, height: 1024 });

	await page.goto(`${LEETCODE_URL}/accounts/github/login/?next=%2F`);

	const continueButton = await page.locator("div ::-p-text(Continue)");

	await page.addStyleTag({ content: "body { background: red !important; }" });

	await continueButton.click({ delay: 400 });
	await page.waitForNavigation();
	const githubUsernameInput = await page.waitForSelector("#login_field");
	const githubPasswordInput = await page.waitForSelector("#password");
	if (!githubPasswordInput || !githubUsernameInput) throw new Error("Issue loading GitHub login page.");

	await githubUsernameInput.type(GITHUB_USERNAME);
	await githubPasswordInput.type(GITHUB_PASSWORD);

	await page.click('input[type="submit"][value="Sign in"]');

	await page.waitForNavigation();

	const problemsButton = await page.locator("a ::-p-text(Problems)");
	await problemsButton.click();

	await page.waitForNavigation();

	const dailyProblemButton = await page.waitForSelector('div[role="table"] div div[role="rowgroup"] > *:first-child');
	if (!dailyProblemButton) throw new Error("Issue loading daily problem page.");
	await dailyProblemButton.click();

	// await page.waitForNavigation();
	// const dailyButton = await page.waitForSelector("div[data-headlessui-state] a");

	// if (!dailyButton) throw new Error("Issue loading daily problem page.");
	// await dailyButton.click();

	await page.waitForNavigation();

	// const cookies = await page.cookies();
	// console.log("COOKIES", cookies);

	const languageButton = await page.locator("button ::-p-text(C++)");
	if (languageButton) {
		await languageButton.click();
		await page.waitForSelector("div ::-p-text(Python3)");
		const pythonButton = await page.locator("div ::-p-text(Python3)");
		await pythonButton.click({ delay: 400 });
	}

	const editorInput = await page.waitForSelector("textarea.inputarea");
	// await page.type(, solution);
	if (editorInput) {
		// await editorInput.click();
		await page.click('div[data-track-load="code_editor"]');

		// delete all original input
		await page.keyboard.press("PageDown");
		await page.keyboard.press("PageDown");
		await page.keyboard.down("Shift");
		await page.keyboard.press("PageUp");
		await page.keyboard.press("PageUp");
		await page.keyboard.up("Shift");
		await page.keyboard.press("Backspace");

		// await editorInput.type(solution);
		await page.evaluate((s) => navigator.clipboard.writeText(s), solution);

		await page.keyboard.down("Shift");
		await page.keyboard.press("Insert");
		await page.keyboard.up("Shift");

		// submit
		await page.click('button[data-e2e-locator="console-submit-button"]');

		// wait for submisison to go through
		await page.waitForNetworkIdle({ idleTime: 500 });
	} else {
		console.log("failed to get");
	}

	// // Type into search box
	// await page.type(".devsite-search-field", "automate beyond recorder");

	// // Wait and click on first result
	// const searchResultSelector = ".devsite-result-item-link";
	// await page.waitForSelector(searchResultSelector);
	// await page.click(searchResultSelector);

	// // Locate the full title with a unique string
	// const textSelector = await page.waitForSelector("text/Customize and automate");

	// // Print the full title
	// console.log('The title of this blog post is "%s".', fullTitle);

	await browser.close();
})();
