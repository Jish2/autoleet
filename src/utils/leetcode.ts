export const LEETCODE_URL = "https://leetcode.com";

export async function getDailyProblem() {
	const response = await fetch(`${LEETCODE_URL}/graphql`, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			Referer: LEETCODE_URL,
		},
		body: JSON.stringify({
			query: `#graphql
      query getDailyProblem {
        activeDailyCodingChallengeQuestion {
            date
            link
            question {
              questionFrontendId
            }
        }
    }`,
			variables: {},
		}),
	});

	const { data } = await response.json();
	return {
		questionId: data.activeDailyCodingChallengeQuestion.question.questionFrontendId,
		link: LEETCODE_URL + data.activeDailyCodingChallengeQuestion.link,
	};
}

(async () => {
	const d = await getDailyProblem();
	console.log(JSON.stringify(d));
})();
