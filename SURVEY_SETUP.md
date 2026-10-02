# October 2026 visitor survey

The survey stays hidden until `/api/survey` reports storage ready. The optional invitation appears after 30 seconds, once per browser when dismissed or opened. A footer button lets visitors reopen it. The survey supports English and Afrikaans. Collection closes at midnight at the end of 31 October 2026, South African time.

## Activate in Cloudflare
1. Create a Workers KV namespace named `stellenbosch-survey-responses` in the account hosting the Pages project.
2. In Workers & Pages → stellenbosch-mental-health → Settings → Bindings, add the KV namespace with variable name `SURVEY_RESPONSES` (production).
3. In Settings → Variables and Secrets, add a secret named `SURVEY_REPORT_TOKEN` containing a long, unique private reporting key. Do not put the value in GitHub, website source, URLs, or chat.
4. Redeploy the latest commit so the new bindings apply.
5. Verify `/api/survey` returns `{"ready":true}`, then perform one explicitly identified test response and confirm it is saved. Exclude the test response when producing the campaign report.

## Month-end results
Open `/survey-results.html` and enter the reporting key. View total completions, answer counts, percentages, or download CSV. Results are protected by the key and are not publicly readable. The reporting key is held only in the current page, not saved to browser storage.

## Data collected
Only three closed-choice answers and the submission date are stored. A random submission identifier is used as the KV key to avoid counting a retried request twice. No name, contact detail, diagnosis, IP address, or free text is saved by the survey code. Hosting infrastructure may process ordinary request metadata. Browser storage remembers invitation dismissal and completion; this is not strict prevention of repeat responses on another browser/device. Results describe self-selected respondents.
