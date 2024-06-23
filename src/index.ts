import puppeteer from "puppeteer";
import { LEETCODE_URL, getDailyProblem } from "./utils/leetcode";
import dotenv from "dotenv";
import { getSolution } from "./utils/solutions";

dotenv.config();

const GITHUB_USERNAME = process.env.GITHUB_USERNAME;
const GITHUB_PASSWORD = process.env.GITHUB_PASSWORD;

if (!GITHUB_USERNAME || !GITHUB_PASSWORD) throw new Error("Please provide GITHUB_USERNAME and GITHUB_PASSWORD in .env file");

(async () => {
	// const leetcodeDailyProblem = await getDailyProblem();
	// console.log(leetcodeDailyProblem.link);

	const browser = await puppeteer.launch({ headless: false });
	const page = await browser.newPage();

	await page.setViewport({ width: 1080, height: 1024 });

	// Navigate the page to a URL
	// await page.goto(`${LEETCODE_URL}/accounts/login/`);
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

	const dailyProblem = await getDailyProblem();

	page.goto(dailyProblem.link);

	const solution = getSolution(dailyProblem.questionId);

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

	// await browser.close();
})();
