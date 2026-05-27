# SpendLens — User Interviews

> ⚠️ **These interviews must be conducted with real humans before submission.**
> Fabricated interviews are an automatic rejection. Each should be 10–15 minutes.
> Talk to founders, engineering managers, or anyone running a team that pays for AI tools.
> Good sources: LinkedIn connections, X/Twitter followers, local startup meetups, YC communities, IndieHackers.

---

## Interview 1

**Interviewee:** Anubhav | **Role:** Student | 
**Date:** 27 May 2026 | **Duration:** 10 mins

**Context:** He is my friend with good front end skills

**Questions asked:**
1. What AI tools does your team currently pay for?
I pay for ChatGPT Plus and Midjourney. I use GitHub Copilot for free via the Student Developer Pack.
2. Do you know your exact monthly AI tooling spend right now?
Exactly $30/month ($20 ChatGPT, $10 Midjourney). On a college budget, I definitely feel that hit.
3. Have you ever felt like you were overpaying or had redundant tools?
Definitely. With Copilot in my IDE and the free tier of Claude being so good, ChatGPT Plus feels redundant. I also forget to pause Midjourney during exam season when I'm not using it.
4. How do you currently decide which AI tools to buy or cancel?
It depends on project deadlines and my bank balance. I keep them active for hackathons and big full-stack projects, and cancel them when the semester ends or money is tight.
5. What would make you take action on a savings recommendation?
The alternative has to be frictionless. If there's a student discount or a free tool that is just as good and doesn't require hours of local setup, I’ll switch instantly.
6. Would a free audit tool be useful? Why or why not?
For my personal $30 spend, it's overkill. It would be a lifesaver to catch accidental API usage spikes or duplicate subscriptions before they drain our accounts.

**Direct quotes:**
1. "On a college budget, I definitely feel that hit."
2. "I also forget to pause Midjourney during exam season when I'm not using it."
3. "It would be a lifesaver to catch accidental API usage spikes or duplicate subscriptions before they drain our accounts."

**Most surprising thing they said:** Subscriptions are treated episodically—active during hackathons, forgotten during exams—which points to a need for pause reminders rather than just cancellation.

**What it changed about the design:** Add a "Student Project" size or use case, and consider "Pause Subscription" as a viable recommendation alongside "Cancel" or "Switch".

---

## Interview 2

**Interviewee:** Gauri | **Role:** Student  
**Date:** 27 May 2026 | **Duration:** 10 mins

**Context:** A highly technical CS student who optimizes costs by using free alternatives and pay-as-you-go APIs rather than fixed monthly subscriptions.

**Questions asked:**
1. What AI tools does your team currently pay for?
I avoid monthly subscriptions. I use Gemini Pro for free via a student promo and Kimi K2.6 (a free Chinese AI with a massive context window) for heavy coding. The only thing I pay for is the Anthropic API, which I plug into my IDE instead of buying a $20 Claude Pro subscription.
2. Do you know your exact monthly AI tooling spend right now?
Yeah, it averages about $5 a month. Because it's pay-as-you-go API tokens, I only pay for what I actually use.
3. Have you ever felt like you were overpaying or had redundant tools?
Not overpaying, since $5 is basically a cup of coffee. But definitely redundant. Now that Kimi is so good for free, I sometimes catch myself burning paid Claude API tokens out of habit on simple boilerplate code that Kimi or Gemini could have handled.
4. How do you currently decide which AI tools to buy or cancel?
I don’t have to cancel anything. If I’m grinding a full-stack project, my API bill goes up a few bucks. During finals, it drops to $0. I just save the paid Claude tokens for complex logic bugs that confuse the free models.
5. What would make you take action on a savings recommendation?
An automated prompt-routing tool. If something could automatically send easy prompts to Kimi/Gemini and only route the hard ones to Claude API, I’d use it. But I won't spend hours manual-tuning setups just to save $1.50.
6. Would a free audit tool be useful? Why or why not?
For my personal $5 budget? No, I just prepaid my account with $10 to cap my risk. But for hackathons where my team shares an API key, absolutely. A tool that stops a teammate from running an infinite loop and burning our credits would be a lifesaver.

**Direct quotes:**
1. "Because it's pay-as-you-go API tokens, I only pay for what I actually use."
2. "I sometimes catch myself burning paid Claude API tokens out of habit on simple boilerplate code that Kimi or Gemini could have handled."
3. "A tool that stops a teammate from running an infinite loop and burning our credits would be a lifesaver."

**Most surprising thing they said:** That they actively use direct API access plugged into their IDE to bypass $20/month subscription fees, reducing their cost to just ~$5/month while accessing top-tier models.

**What it changed about the design:** We need to consider adding a recommendation type to "Switch to API usage" for technical users who don't utilize $20 worth of value per month. Also, tracking shared API key usage spikes (like during hackathons) could be a great new feature or use case.

---

## Summary of Insights

*Both interviews highlighted that student and indie-hacker users have highly episodic AI needs (heavy usage during hackathons/projects, zero usage during exams). A strict $20/month subscription model punishes this usage pattern. Both users found value in team-level auditing to prevent runaway costs from peers, but found personal audits less necessary for small budgets.*

| Theme | Interview 1 (Anubhav) | Interview 2 (Gauri) |
|-------|-------------|-------------|
| Knows current AI spend | Yes ($30/mo) | Yes (~$5/mo via API) |
| Has redundant tools | Yes (ChatGPT vs free Claude/Copilot) | Yes (Paid API vs free Kimi/Gemini) |
| Would use a free audit | Only for team/club accounts | Only for shared hackathon API keys |
| Biggest pain point | Forgetting to pause subs during exams | Accidental API burn from teammates |
