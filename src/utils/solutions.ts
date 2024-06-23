import { JSDOM } from "jsdom";

const LEETCODE_CA_BASE_URL = "https://leetcode.ca";

export async function getSolutionURL(problemNumber: number) {
	const regex = `Problem Solution<\/h3>\n[ ]+<a[\n ]+style="font-size:20px;color: #0066cc;margin-bottom:15px;text-decoration:underline"[\n ]+href="([A-z.\/0-9:\-]+)">`;
	const url = `${LEETCODE_CA_BASE_URL}/all/${problemNumber}.html`;

	const response = await fetch(url);
	const html = await response.text();

	const match = html.match(regex);

	if (!match) throw new Error("Could not find solution URL");

	const solutionURL = match[1];

	return solutionURL;
}

export async function getSolution(problemNumber: number) {
	const solutionURL = await getSolutionURL(problemNumber);

	const response = await fetch(solutionURL);
	const html = await response.text();

	const dom = new JSDOM(html);
	const codeSnippet = dom.window.document.querySelector(".language-py div pre code")?.textContent;

	if (!codeSnippet) throw new Error("Could not find code snippet");

	return codeSnippet;
}
