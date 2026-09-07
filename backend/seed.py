"""Seeds the database with 5 realistic meetings — full transcripts, summaries,
topics, and action items — so the app looks populated from first run.

Run with: ./venv/bin/python seed.py
"""
from datetime import datetime, timedelta, timezone

from app.db import Base, SessionLocal, engine, init_db
from app.models.action_item import ActionItem
from app.models.meeting import Meeting
from app.models.participant import Participant
from app.models.summary import Summary
from app.models.topic import Topic
from app.models.transcript import TranscriptSegment
from app.models.user import User

# ---------------------------------------------------------------------------
# Participant pool. Reused across meetings (by key) to demonstrate the
# meetings <-> participants many-to-many relationship — e.g. "priya" attends
# three different meetings below as the same underlying row.
# ---------------------------------------------------------------------------
PARTICIPANTS = {
    "yash": dict(name="Yash Agarwal", email="yash21chess@gmail.com", avatar_color="#6D5EF8"),
    "priya": dict(name="Priya Nair", email="priya.nair@northwind.io", avatar_color="#10B981"),
    "taylor": dict(name="Taylor Kim", email="taylor.kim@northwind.io", avatar_color="#8B5CF6"),
    "morgan": dict(name="Morgan Blake", email="morgan.blake@northwind.io", avatar_color="#14B8A6"),
    "devon": dict(name="Devon Brooks", email="devon.brooks@northwind.io", avatar_color="#6366F1"),
    "jordan": dict(name="Jordan Lee", email="jordan.lee@brightpath.com", avatar_color="#EF4444"),
    "sam": dict(name="Sam Chen", email="sam.chen@brightpath.com", avatar_color="#3B82F6"),
    "casey": dict(name="Casey Nguyen", email="casey.nguyen@northwind.io", avatar_color="#F97316"),
    "riley": dict(name="Riley Ortiz", email="riley.ortiz@globex.com", avatar_color="#EC4899"),
}


def build_segments(entries: list[tuple[str, str, float, float]]) -> list[dict]:
    """entries: (speaker_key, text, spoken_seconds, pause_after_seconds) in order.
    Returns segments with cumulative start/end times, so timing only needs to
    be authored as "how long did this line take", not absolute timestamps.
    """
    segments = []
    t = 0.0
    for speaker, text, spoken, pause in entries:
        start, end = t, t + spoken
        segments.append({"speaker": speaker, "start": start, "end": end, "text": text})
        t = end + pause
    return segments


MEETINGS = [
    {
        "title": "Product Sync – Q3 Roadmap Planning",
        "date": datetime(2026, 8, 18, 15, 0, tzinfo=timezone.utc),
        "participants": ["yash", "priya", "taylor"],
        "entries": [
            ("yash", "Thanks for hopping on, everyone. Today's goal is to lock the Q3 roadmap before Friday's leadership review.", 8, 3),
            ("priya", "Sounds good. From engineering's side, transcript search and the meeting detail page keep coming up as the top two asks from the customer survey.", 10, 3),
            ("taylor", "Design already has wireframes ready for the transcript search UI, so that one could ship fast if we prioritize it.", 8, 2),
            ("yash", "Let's make transcript search P0 then. Priya, any concerns on scope or timeline?", 6, 3),
            ("priya", "Not really — we already store start and end timestamps per segment, so search is mostly building an index and a highlight layer on top.", 10, 3),
            ("yash", "Great, what about the meeting detail page redesign?", 5, 2),
            ("taylor", "That one's bigger. We need the media player, transcript panel, and summary panel to all sync together, so I'd call it two sprints, not one.", 10, 3),
            ("priya", "Agreed, two sprints feels right if we want it done properly instead of rushed.", 6, 2),
            ("yash", "Okay, P1 then, starting right after search ships.", 5, 3),
            ("taylor", "One more thing — should dark mode be part of Q3 or push to Q4?", 6, 2),
            ("priya", "I'd push it. It's nice to have but nothing customers are actively blocked on.", 6, 3),
            ("yash", "Agreed, Q4 bonus item. Let's also talk export — PDF and Markdown export for transcripts.", 7, 3),
            ("taylor", "That's mostly a backend formatting job once the transcript data model is finalized, so it's a low design lift.", 7, 2),
            ("priya", "I can scope that for later in Q3, once search and the detail page are stable.", 6, 3),
            ("yash", "Perfect. Priya, you're driving transcript search end to end?", 5, 2),
            ("priya", "Yep, I'll own it and pull in one more engineer once we lock the indexing approach.", 6, 3),
            ("yash", "Taylor, can you finalize the detail page mockups by next Wednesday so engineering can start estimating?", 7, 2),
            ("taylor", "Wednesday works, I'll drop the Figma link in the team channel once it's ready.", 6, 3),
            ("yash", "Awesome, that covers the roadmap. I'll send a recap doc right after this call.", 6, 2),
            ("priya", "Sounds good, thanks everyone.", 3, 2),
            ("taylor", "Thanks all, talk soon.", 3, 0),
        ],
        "topics": [
            ("Q3 roadmap priorities", 0),
            ("Transcript search scoping", 4),
            ("Meeting detail page redesign", 6),
            ("Dark mode timing debate", 9),
            ("Export feature (PDF / Markdown)", 11),
            ("Ownership and deadlines", 14),
        ],
        "summary": (
            "The team locked the Q3 roadmap: transcript search ships first as P0, followed by a "
            "two-sprint meeting detail page redesign. Dark mode and PDF/Markdown export were "
            "deprioritized to later in Q3 and Q4. Priya owns transcript search, Taylor will finalize "
            "detail page mockups by Wednesday, and Yash will circulate a recap doc."
        ),
        "action_items": [
            ("Scope transcript search indexing approach and pull in a second engineer", "priya", 5, False),
            ("Finalize meeting detail page Figma mockups", "taylor", 3, False),
            ("Send Q3 roadmap recap doc to the team", "yash", 1, True),
            ("Draft technical scope for PDF/Markdown export", "priya", 10, False),
            ("Confirm Q4 backlog placement for dark mode", "yash", 14, False),
        ],
    },
    {
        "title": "Sales Discovery Call – Brightpath Ventures",
        "date": datetime(2026, 8, 25, 18, 0, tzinfo=timezone.utc),
        "participants": ["yash", "jordan", "sam"],
        "entries": [
            ("yash", "Thanks for making time, Jordan, Sam. To kick off, can you tell me what's driving the search for a meeting intelligence tool right now?", 10, 3),
            ("jordan", "Sure — we're scaling fast and losing a lot of context between sales and customer success. Nobody has time to rewatch call recordings.", 9, 3),
            ("sam", "And from IT's side, we need something SOC 2 compliant that doesn't require us to store recordings ourselves.", 8, 3),
            ("yash", "Got it. We're SOC 2 Type II certified, and recordings can live on our infrastructure or yours depending on your data residency needs.", 9, 3),
            ("jordan", "Good to hear. How does transcription accuracy compare across accents and background noise?", 7, 3),
            ("yash", "We see high accuracy on clear audio, and the transcript is fully editable afterward, with every line timestamped and clickable.", 8, 3),
            ("sam", "Can it integrate with our CRM? We're on a HubSpot-adjacent internal tool.", 6, 3),
            ("yash", "We support webhook-based integrations today, and a native CRM sync is on our near-term roadmap.", 6, 3),
            ("jordan", "What about pricing for a team of around 40 people?", 5, 2),
            ("yash", "For 40 seats you'd be in our Business tier — I'll send a formal quote after this call.", 6, 3),
            ("sam", "One more thing — can we bulk import our historical call recordings to get transcripts backfilled?", 7, 3),
            ("yash", "Yes, bulk upload is supported for audio and video, we just batch-process them through the same pipeline.", 7, 3),
            ("jordan", "That's helpful, we have about six months of recorded onboarding calls we'd love searchable.", 6, 3),
            ("yash", "Perfect, I'll include backfill scoping in the proposal. Anything else before we wrap?", 6, 3),
            ("sam", "Just security — could you send your SOC 2 report and data processing agreement?", 6, 2),
            ("yash", "Absolutely, I'll attach both to the follow-up email along with the pricing quote.", 5, 3),
            ("jordan", "Great, appreciate the thorough walkthrough today.", 4, 2),
            ("yash", "Thanks both, I'll follow up by end of week with everything we discussed.", 5, 0),
        ],
        "topics": [
            ("Why Brightpath is evaluating meeting intelligence tools", 0),
            ("Security and compliance requirements", 2),
            ("Transcription accuracy and editability", 4),
            ("CRM integration needs", 6),
            ("Pricing for a 40-seat team", 8),
            ("Historical call backfill", 10),
        ],
        "summary": (
            "Brightpath Ventures is evaluating meeting intelligence tools to close context gaps "
            "between sales and CS as they scale, with SOC 2 compliance and data residency as hard "
            "requirements. Yash will send a 40-seat Business tier quote, the SOC 2 report and DPA, "
            "and scope a backfill of roughly six months of historical recordings into the proposal."
        ),
        "action_items": [
            ("Send formal pricing quote for 40 seats (Business tier)", "yash", 2, False),
            ("Send SOC 2 report and data processing agreement to Brightpath", "yash", 1, False),
            ("Include backfill scoping for ~6 months of historical recordings in proposal", "yash", 3, False),
            ("Confirm native CRM sync roadmap timeline internally", "yash", 7, False),
            ("Send full recap email with next steps to Brightpath", "yash", 4, False),
        ],
    },
    {
        "title": "Engineering Standup – Sprint 14",
        "date": datetime(2026, 9, 1, 14, 0, tzinfo=timezone.utc),
        "participants": ["priya", "morgan", "devon"],
        "entries": [
            ("priya", "Morning everyone, quick sync on Sprint 14. Morgan, want to start?", 5, 2),
            ("morgan", "Sure. I finished the transcript search indexing yesterday, it's passing tests locally, opening the PR this morning.", 8, 3),
            ("priya", "Nice, that unblocks the search UI work. Any risks before merge?", 6, 3),
            ("morgan", "Just need a second pair of eyes on the SQLite full-text index migration, want to make sure it doesn't lock the table on large datasets.", 9, 3),
            ("devon", "I can review that this afternoon, I did something similar on the last project.", 6, 3),
            ("priya", "Perfect, thanks Devon. What's your status on the action items CRUD endpoints?", 6, 3),
            ("devon", "Create, update, and delete are done and tested. I'm still working through edge cases on due date validation.", 7, 3),
            ("priya", "Good catch, what's the issue exactly?", 4, 2),
            ("devon", "If someone sets a due date in the past it currently just saves silently, I think we want a warning instead of a hard block.", 8, 3),
            ("priya", "Agreed, a soft warning makes sense, some tasks genuinely are already overdue when logged.", 6, 3),
            ("morgan", "Also flagging, the meeting detail endpoint gets a bit slow with large transcripts, might need pagination or lazy loading eventually.", 8, 3),
            ("priya", "Let's not over-engineer that yet, but add it as a note for when we see a real meeting running a couple hours.", 7, 3),
            ("devon", "Makes sense. I'll wrap up due date validation today and start participant search filtering tomorrow.", 7, 3),
            ("priya", "Sounds good. Anything blocking either of you?", 5, 2),
            ("morgan", "Nope, all clear on my side.", 3, 2),
            ("devon", "Same here, all good.", 3, 2),
            ("priya", "Great, let's leave it there. Same time tomorrow.", 4, 0),
        ],
        "topics": [
            ("Transcript search indexing PR", 1),
            ("SQLite full-text index migration risk", 3),
            ("Action items CRUD status", 5),
            ("Due date validation edge case", 8),
            ("Meeting detail endpoint performance on large transcripts", 10),
            ("Blockers check-in", 13),
        ],
        "summary": (
            "Sprint 14 standup: transcript search indexing is complete and headed for PR review, "
            "with a flagged risk around the SQLite full-text index migration on large tables. Action "
            "item CRUD is functionally done pending a fix for past-due-date validation. Meeting "
            "detail endpoint performance on very large transcripts was noted as a future backlog "
            "item, not an immediate blocker."
        ),
        "action_items": [
            ("Review SQLite full-text index migration PR", "devon", 1, False),
            ("Open PR for transcript search indexing", "morgan", 0, True),
            ("Add soft warning for past due dates instead of silent save", "devon", 2, False),
            ("Start participant search filtering", "devon", 3, False),
            ("Log meeting detail endpoint performance concern as a backlog item", "priya", 7, False),
        ],
    },
    {
        "title": "Customer Onboarding – Globex Inc",
        "date": datetime(2026, 9, 3, 16, 30, tzinfo=timezone.utc),
        "participants": ["yash", "casey", "riley"],
        "entries": [
            ("yash", "Hi Riley, welcome! Casey and I are here to get your team set up. How many people will be using the platform initially?", 9, 3),
            ("riley", "Thanks for having us. We're starting with about 15 people across sales and support.", 6, 3),
            ("casey", "Great, I'll provision 15 seats today. Riley, do you want SSO enabled from day one?", 7, 3),
            ("riley", "Yes please, we're on Okta company-wide.", 4, 2),
            ("yash", "No problem, we support Okta SAML, Casey can send the setup guide right after this call.", 6, 3),
            ("riley", "Perfect. Our main use case is capturing customer support calls and pulling action items automatically.", 7, 3),
            ("casey", "That's a great fit. Once a call ends, the summary and action items usually generate within a couple minutes.", 7, 3),
            ("riley", "Can action items be assigned directly to people on our team?", 5, 3),
            ("yash", "Yes, as long as they're added as participants or set up as users, you can assign directly during or after the call.", 8, 3),
            ("riley", "Good. Do you have a Zendesk integration? We live in Zendesk for support tickets.", 6, 3),
            ("casey", "Not natively yet, but we support webhook exports, so a lot of customers pipe action items into Zendesk that way.", 8, 3),
            ("riley", "Okay, our engineering team can probably wire that up on our end.", 5, 3),
            ("yash", "Happy to share our webhook payload docs so that's easier for them.", 5, 3),
            ("riley", "That'd be great. One last thing — is there a training session for our team?", 6, 3),
            ("casey", "Yes, I'll schedule a 30-minute onboarding walkthrough for your team next week.", 6, 3),
            ("riley", "Sounds perfect, thanks both for the thorough setup.", 4, 2),
            ("yash", "Of course, welcome aboard! Casey will follow up with next steps today.", 5, 0),
        ],
        "topics": [
            ("Initial seat provisioning (15 users)", 1),
            ("Okta SSO setup", 3),
            ("Core use case: support call capture + action items", 5),
            ("Assigning action items to team members", 7),
            ("Zendesk / webhook integration", 9),
            ("Team training session scheduling", 13),
        ],
        "summary": (
            "Globex Inc onboarded 15 initial seats with Okta SSO for company-wide SAML login. Their "
            "primary use case is capturing support calls with automatic action item extraction; "
            "since they run support through Zendesk, they'll use webhook exports to sync action "
            "items rather than a native integration for now. Casey will schedule a team training "
            "session next week."
        ),
        "action_items": [
            ("Provision 15 seats for Globex team", "casey", 1, True),
            ("Send Okta SAML setup guide to Riley", "casey", 1, False),
            ("Share webhook payload documentation for Zendesk integration", "yash", 2, False),
            ("Schedule 30-minute onboarding training session for Globex team", "casey", 5, False),
            ("Confirm participant/user setup so action items can be assigned to Globex team members", "riley", 3, False),
        ],
    },
    {
        "title": "All Hands – September Product Update",
        "date": datetime(2026, 9, 5, 17, 0, tzinfo=timezone.utc),
        "participants": ["yash", "priya", "taylor", "morgan"],
        "entries": [
            ("yash", "Thanks everyone for joining the September all hands. Quick agenda: product update, engineering update, then open Q&A.", 8, 3),
            ("yash", "On the product side, transcript search shipped last week and early usage is strong — about 40% of active accounts have used it already.", 9, 3),
            ("taylor", "The design team also just wrapped the new meeting detail page, it's in engineering's hands now for implementation.", 7, 3),
            ("priya", "Confirming that, we're targeting the detail page redesign for the next two sprints, should be live by end of month.", 7, 3),
            ("morgan", "On the backend side, we also finished the action items CRUD API and shipped due dates and completion tracking.", 7, 3),
            ("yash", "Great progress all around. Any adoption concerns on transcript search so far?", 6, 3),
            ("priya", "A few users reported slow results on very long transcripts, we're optimizing the index this week.", 7, 3),
            ("yash", "Good to know, keep us posted. What's next after the detail page ships?", 6, 3),
            ("taylor", "Export to PDF and Markdown is next on design's plate, wireframes should be ready in about two weeks.", 7, 3),
            ("morgan", "And I'll start scoping the export backend work in parallel once the data model settles.", 6, 3),
            ("yash", "Perfect, sounds like Q3 is tracking well. Let's open it up for questions.", 6, 3),
            ("priya", "One thing worth flagging — we're seeing early interest in an 'ask AI about this meeting' feature from a few customer calls.", 8, 3),
            ("yash", "Noted, that's on the bonus list, we'll revisit prioritization once export ships.", 6, 3),
            ("taylor", "Also curious if dark mode is getting picked back up this quarter or pushed to Q4.", 6, 3),
            ("yash", "Still planning for Q4, but if the team has bandwidth after export we could pull it forward.", 7, 3),
            ("morgan", "I could probably start a rough dark mode pass in parallel, it's mostly CSS variables at this point.", 7, 3),
            ("priya", "If Morgan's up for it, I'm fine pulling it into late Q3 as a stretch goal.", 6, 3),
            ("yash", "Let's call it a stretch goal then, not a commitment. Great update everyone, thanks for joining.", 7, 0),
        ],
        "topics": [
            ("Transcript search launch results", 1),
            ("Meeting detail page redesign status", 2),
            ("Action items CRUD + due dates shipped", 4),
            ("Search performance on long transcripts", 6),
            ("Export to PDF/Markdown planning", 8),
            ("Dark mode stretch goal discussion", 13),
        ],
        "summary": (
            "September all-hands recap: transcript search shipped and is already used by roughly 40% "
            "of active accounts, though long transcripts need search performance tuning. The meeting "
            "detail page redesign is moving into engineering with a two-sprint target, followed by "
            "PDF/Markdown export. Dark mode was floated as a late-Q3 stretch goal, and an 'ask AI "
            "about this meeting' feature is being considered after export ships."
        ),
        "action_items": [
            ("Optimize transcript search index for long transcripts", "priya", 7, False),
            ("Implement meeting detail page redesign", "priya", 14, False),
            ("Deliver PDF/Markdown export wireframes", "taylor", 14, False),
            ("Scope export backend work once data model settles", "morgan", 14, False),
            ("Prototype dark mode CSS-variable pass as a stretch goal", "morgan", 21, False),
            ("Revisit 'ask AI about this meeting' prioritization after export ships", "yash", 30, False),
        ],
    },
]


def seed() -> None:
    Base.metadata.drop_all(bind=engine)
    init_db()

    db = SessionLocal()
    try:
        user = User(name="Yash Agarwal", email="yash21chess@gmail.com")
        db.add(user)
        db.flush()

        participants = {
            key: Participant(**fields) for key, fields in PARTICIPANTS.items()
        }
        db.add_all(participants.values())
        db.flush()

        for meeting_data in MEETINGS:
            segments = build_segments(meeting_data["entries"])
            duration_seconds = int(segments[-1]["end"]) + 40

            meeting = Meeting(
                user_id=user.id,
                title=meeting_data["title"],
                date=meeting_data["date"],
                duration_seconds=duration_seconds,
                status="completed",
                participants=[participants[key] for key in meeting_data["participants"]],
            )
            db.add(meeting)
            db.flush()

            for index, seg in enumerate(segments):
                db.add(
                    TranscriptSegment(
                        meeting_id=meeting.id,
                        speaker_id=participants[seg["speaker"]].id,
                        start_time_sec=seg["start"],
                        end_time_sec=seg["end"],
                        text=seg["text"],
                        order_index=index,
                    )
                )

            db.add(Summary(meeting_id=meeting.id, overview_text=meeting_data["summary"]))

            for order_index, (title, segment_index) in enumerate(meeting_data["topics"]):
                db.add(
                    Topic(
                        meeting_id=meeting.id,
                        title=title,
                        order_index=order_index,
                        start_time_sec=segments[segment_index]["start"],
                    )
                )

            for text, assignee_key, due_offset_days, is_complete in meeting_data["action_items"]:
                db.add(
                    ActionItem(
                        meeting_id=meeting.id,
                        text=text,
                        assignee_id=participants[assignee_key].id,
                        due_date=meeting_data["date"] + timedelta(days=due_offset_days),
                        is_complete=is_complete,
                    )
                )

        db.commit()
        print(f"Seeded {len(participants)} participants and {len(MEETINGS)} meetings.")
    finally:
        db.close()


if __name__ == "__main__":
    seed()
