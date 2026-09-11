// Engagement counts are editable fictional GLFL storytelling, not live analytics.
// Keep IDs stable. quotePost references an ID in this array (including your own posts).
// profile paths are relative to the repository root on BOTH pages. Omit for initials.
const glflSocialFeed = [
	
	{
		id: "2026-09-11-remembering-septtember-eleventh",
		likes: 2852,
		reposts: 100,
		accountType: "league",
		profile: "images/Logo.png",
		reporter: "GLFL",
		handle: "@GLFL",
		bureau: "League Office",
		category: "leaguenews",
		type: "\u{1F1FA}\u{1F1F8} REMEMBERING 9/11",
		time: "Sep 11, 8:46 AM",
		text: "Today, on the 25th anniversary of September 11, 2001, the GLFL remembers the lives lost, the families forever changed, and the courage of the first responders and countless others who answered the call. We will never forget."
	},
	
	
	{
        id: "2026-09-11-mack-wilson",
        likes: 1,
        reposts: 4,
		profile: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSb4F7OFEbcvaFd7JpcmJZt1TV9JqdEdWiD1s4LfNDCEObqHlGHj7BUvHai&s=10",
        reporter: "Jack Callahan",
		handle: "@JC_BeanTown",
		bureau: "Boston",
		category: "roster",
		type: "\u{1F6A8} ROSTER MOVE",
		time: "Sep 11, 7:32 AM",
		text: "Brawlers pickup Mack Wilson Sr. waiving WR Joshua Palmer to make room."
	},

	
	{
        id: "2026-09-10-mercer-irving-trade",
        likes: 96,
        reposts: 24,
        quotePost: "2026-09-10-titans-irving-trade",
        profile: "https://res.cloudinary.com/dp5nzokay/image/fetch/q_95,c_fill,g_face,w_810,h_656,f_auto/https://cdn.tymbrel.com/site/2856/images/directory/6UGN/employees/dr-evan-mercer.jpg",
        reporter: "Evan Mercer",
		handle: "@EvanMercer",
		bureau: "Cedar Rapids",
		category: "trade",
		type: "\u{1F7E2} CEDAR RAPIDS",
		time: "Sep 10, 12:55 PM",
		text: "The Titans needed another weapon, and they got one. Cedar Rapids sends WR Luther Burden III to Miami and brings RB Bucky Irving to the Titans. In addition the Titans sign LB Barrett Carter"
	},
	
	
	{
        id: "2026-09-10-titans-irving-trade",
        likes: 186,
        reposts: 42,
        accountType: "team",
        profile: "images/CedarRapids.png",
        reporter: "Cedar Rapids Titans",
		handle: "@CRTitans",
		bureau: "Cedar Rapids",
		category: "trade",
		type: "\u{1F6A8} TRADE",
		time: "Sep 10, 1:10 PM",
		text: "BREAKING: The Titans have acquired RB Bucky Irving from Miami in exchange for WR Luther Burden III. Welcome to Cedar Rapids, Bucky."
		},
	

		{
        id: "2026-09-10-reed-trade-chatter",
        likes: 73,
        reposts: 11,
		profile: "https://framerusercontent.com/images/pEA9rY2OIaROXKmBnWYoeIk2PRQ.jpg?width=1365&height=2048",
		reporter: "Marcus Reed",
		handle: "@MarcusReed",
		bureau: "Chicago",
		category: "rumor",
		type: "\u{1F440} LEAGUE CHATTER",
		time: "Sep 10, 1:02 PM",
		text: "Chicago was looking for a running back. Miami was looking for a WR. Somehow, those calls never turned into a deal. Bucky Irving is headed to Cedar Rapids instead."
		
		},
	
	
	{
        id: "2026-09-10-russo-burden-trade",
        likes: 82,
        reposts: 17,
        profile: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT_fH3GzqWsFn3OfIYcxIS0VA8WAgieiZjEO0VMpk8T-u5wakhMS9mfylnS&s=10",
		reporter: "Frank Russo",
		handle: "@RussoRemembers",
		bureau: "Miami",
		category: "trade",
		type: "\u{1F525} MIAMI",
		time: "Sep 10, 12:52 PM",
		text: "Richard Head said Miami needed a WR. He wasn't kidding. The Inferno turn Bucky Irving into Luther Burden III and make their first major move of the season. In addition to signing CB Tyrique Stevenson."
	},


	
	{
        id: "2026-09-09-glfl-kickoff",
        likes: 1204,
        reposts: 218,
        accountType: "league",
        profile: "images/Logo.png",
        reporter: "GLFL",
		handle: "@GLFL",
		bureau: "League Office",
		type: "\u{1F3C8} KICKOFF",
		category: "leaguenews",
		time: "Sep 9, 7:15 PM",
		text: "The wait is over. GLFL football is back, and the 2026 season officially starts tonight. Week 1 is here!"
	},
	
	{
        id: "2026-09-09-russo-wr-search",
        likes: 38,
        reposts: 9,
        profile: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT_fH3GzqWsFn3OfIYcxIS0VA8WAgieiZjEO0VMpk8T-u5wakhMS9mfylnS&s=10",
		reporter: "Frank Russo",
		handle: "@RussoRemembers",
		bureau: "Miami",
		type: "\u{1F440} LEAGUE CHATTER",
		category: "rumor",
		time: "Sep 9, 3:45 PM",
		text: "Miami GM has sent a message around the league: Miami is looking for a WR. The Inferno apparently have running backs available in return. Let the trade calls begin."
	},

	{
        id: "2026-09-09-deluca-black",
        likes: 21,
        reposts: 4,
		profile: "https://www.retireguide.com/wp-content/uploads/anthony_deluca-scaled.jpg",
        reporter: "Tony DeLuca",
		handle: "@TonyTakes",
		bureau: "Brooklyn",
		category: "roster",
		type: "\u{1F6A8} ROSTER MOVE",
		time: "Sep 9, 3:32 PM",
		text: "Brooklyn releases veteran QB Joe Flacco and signs RB Kaelon Black for $1. Cory Colvin is making moves before Week 1."
	},

	{
        id: "2026-09-09-reed-dulcich",
        likes: 3,
        reposts: 0,
		profile: "https://framerusercontent.com/images/pEA9rY2OIaROXKmBnWYoeIk2PRQ.jpg?width=1365&height=2048",
        reporter: "Marcus Reed",
		handle: "@MarcusReed",
		bureau: "Chicago",
		type: "\u{1F6A8} ROSTER MOVE",
		category: "roster",
		time: "Sep 9, 3:18 PM",
		text: "Chicago signs TE Greg Dulcich. Darrien Clay continues to work the roster after an extremely active week on the transaction wire."
	},
	
	
    {
        id: "2026-09-04-gallagher-walker",
        likes: 64,
        reposts: 8,
		profile: "https://images.sidearmdev.com/resize?url=https%3A%2F%2Fdxbhsrqyrr690.cloudfront.net%2Fsidearm.nextgen.sites%2Fmiamiredhawks.com%2Fimages%2F2023%2F7%2F12%2FD0000OqGhF6sWLls_Gallagher__yQwR2.jpg&width=1600&type=jpeg",
        reporter: "Tommy Gallagher",
        handle: "@TommyOnTheMustangs",
        bureau: "Milwaukee",
        type: "\u{1F440} LEAGUE CHATTER",
		category: "rumor",
		time: "Sep 4, 4:08 PM",
        text: "Spoke with GM Bautch on the interest in Kenneth Walker III from other teams. They aren't moving him just to make a trade. If he gets moved, the price is going to matter."
    },

    {
        id: "2026-09-04-reed-walker",
        likes: 47,
        reposts: 12,
		profile: "https://framerusercontent.com/images/pEA9rY2OIaROXKmBnWYoeIk2PRQ.jpg?width=1365&height=2048",
		reporter: "Marcus Reed",
        handle: "@MarcusReed",
        bureau: "Chicago",
		type: "\u{1F7E2} SOURCES SAY",
		category: "rumor",
		time: "Sep 4, 1:08 PM",
        text: "Hearing Darrien Clay has reached out to Milwaukee regarding Kenneth Walker III. The Slaughter appear to be looking for running back help, but a deal may require more than a straight player swap."
    },

    {
        id: "2026-09-03-calloway-draft-recap",
        likes: 118,
        reposts: 29,
		profile: "https://wsvn.com/wp-content/uploads/sites/2/2019/01/ETHAN-CALLOWAY_506.png",
        reporter: "Ethan Calloway",
        handle: "@EthanCalloway",
        bureau: "GLFL National",
		type: "\u{1F4DD} NEW ARTICLE",
		category: "article",
		time: "Sep 3, 4:42 PM",
        text: "My 2026 GLFL Draft Recap is live. Winners, losers and the moves that could shape the season."
    },

    {
        id: "2026-08-31-reed-holani",
        likes: 9,
        reposts: 1,
		profile: "https://framerusercontent.com/images/pEA9rY2OIaROXKmBnWYoeIk2PRQ.jpg?width=1365&height=2048",
		reporter: "Marcus Reed",
        handle: "@MarcusReed",
        bureau: "Chicago",
		type: "\u{1F6A8} ROSTER MOVE",
		category: "roster",
		time: "Aug 31, 11:02 AM",
        text: "Chicago adds RB George Holani for $2, with Emanuel Wilson heading to waivers. The Slaughter continue to churn the bottom of the roster."
    },

    {
        id: "2026-08-31-thompson-bonitto",
        likes: 16,
        reposts: 2,
		profile: "https://wp.theringer.com/wp-content/uploads/2024/11/Thompson_Derek.jpg",
        reporter: "Derek Thompson",
        handle: "@DerekSeesIt",
        bureau: "Philadelphia",
		type: "\u{1F6A8} ROSTER MOVE",
		category: "roster",
		time: "Aug 31, 11:02 AM",
        text: "Philadelphia adds DE Nik Bonitto for $1. A quiet move, but the Soul continue to add depth ahead of Week 1."
    },

    {
        id: "2026-08-31-reed-fields",
        likes: 6,
        reposts: 0,
		profile: "https://framerusercontent.com/images/pEA9rY2OIaROXKmBnWYoeIk2PRQ.jpg?width=1365&height=2048",
		reporter: "Marcus Reed",
        handle: "@MarcusReed",
        bureau: "Chicago",
		type: "\u{1F6A8} ROSTER MOVE",
		category: "roster",
		time: "Aug 31, 11:02 AM",
        text: "Another Chicago move: WR Malachi Fields joins the Slaughter for $1, with Devin Neal released to waivers. Darrien Clay is clearly not done tinkering."
    },

    {
        id: "2026-08-31-reed-lane",
        likes: 8,
        reposts: 1,
		profile: "https://framerusercontent.com/images/pEA9rY2OIaROXKmBnWYoeIk2PRQ.jpg?width=1365&height=2048",
		reporter: "Marcus Reed",
        handle: "@MarcusReed",
        bureau: "Chicago",
		type: "\u{1F6A8} ROSTER MOVE",
		category: "roster",
		time: "Aug 31, 11:02 AM",
        text: "Chicago adds WR Ja'Kobi Lane for $1 and sends Kimani Vidal to waivers. That's three additions in the early roster churn."
    },

    {
        id: "2026-08-31-reed-lance",
        likes: 4,
        reposts: 0,
		profile: "https://framerusercontent.com/images/pEA9rY2OIaROXKmBnWYoeIk2PRQ.jpg?width=1365&height=2048",
		reporter: "Marcus Reed",
        handle: "@MarcusReed",
        bureau: "Chicago",
		type: "\u{1F6A8} ROSTER MOVE",
		category: "roster",
		time: "Aug 31, 11:02 AM",
        text: "The Slaughter keep working the waiver wire, adding WR Bryce Lance for $1 and releasing Isaiah Davis. Chicago's roster is starting to look very different from draft night."
    },

    {
        id: "2026-08-31-reed-henley",
        likes: 12,
        reposts: 2,
		profile: "https://framerusercontent.com/images/pEA9rY2OIaROXKmBnWYoeIk2PRQ.jpg?width=1365&height=2048",
		reporter: "Marcus Reed",
        handle: "@MarcusReed",
        bureau: "Chicago",
		type: "\u{1F6A8} ROSTER MOVE",
		category: "roster",
		time: "Aug 31, 11:02 AM",
        text: "Chicago adds LB Daiyan Henley for $1, with Omar Speights heading to waivers. Six roster moves in a short stretch. Clay is keeping the transaction wire busy."
    }

];
