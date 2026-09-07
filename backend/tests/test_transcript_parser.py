import pytest

from app.services.transcript_parser import TranscriptParseError, parse_transcript


def test_parse_plain_format():
    text = (
        "[00:00] Alex: Thanks for joining everyone.\n"
        "[00:12] Priya: Happy to be here.\n"
        "still talking\n"
        "[00:25] Alex: Great, let's start."
    )
    segments = parse_transcript(text)

    assert len(segments) == 3
    assert segments[0].speaker_name == "Alex"
    assert segments[0].start_time_sec == 0
    assert segments[0].end_time_sec == 12  # inferred from the next segment's start
    assert segments[1].speaker_name == "Priya"
    assert segments[1].text == "Happy to be here. still talking"  # continuation line folded in
    assert segments[2].start_time_sec == 25
    assert segments[2].end_time_sec > 25  # last segment: estimated from word count


def test_parse_plain_without_brackets_and_hour_timestamp():
    text = "1:02:03 Jordan: Long meeting, we're over an hour in."
    segments = parse_transcript(text)

    assert len(segments) == 1
    assert segments[0].start_time_sec == 3723  # 1h2m3s


def test_parse_plain_rejects_unrecognized_format():
    with pytest.raises(TranscriptParseError):
        parse_transcript("just some prose with no timestamps or speakers at all")


def test_parse_rejects_empty_transcript():
    with pytest.raises(TranscriptParseError):
        parse_transcript("   \n  ")


def test_parse_vtt_format():
    text = (
        "WEBVTT\n\n"
        "1\n"
        "00:00:00.000 --> 00:00:05.000\n"
        "Sarah: We're aiming for a seamless onboarding experience.\n\n"
        "2\n"
        "00:00:05.500 --> 00:00:09.000\n"
        "No speaker prefix here."
    )
    segments = parse_transcript(text)

    assert len(segments) == 2
    assert segments[0].speaker_name == "Sarah"
    assert segments[0].start_time_sec == 0
    assert segments[0].end_time_sec == 5
    assert segments[1].speaker_name is None
    assert segments[1].text == "No speaker prefix here."


def test_parse_vtt_rejects_no_cues():
    with pytest.raises(TranscriptParseError):
        parse_transcript("WEBVTT\n\njust some notes, no cue lines")


def test_parse_json_format():
    text = (
        '[{"speaker": "Devon", "start": 0, "end": 4.5, "text": "Kicking off the standup."},'
        ' {"speaker_name": "Morgan", "start_time_sec": 4.5, "end_time_sec": 9, "text": "Sounds good."}]'
    )
    segments = parse_transcript(text)

    assert len(segments) == 2
    assert segments[0].speaker_name == "Devon"
    assert segments[0].end_time_sec == 4.5
    assert segments[1].speaker_name == "Morgan"


def test_parse_json_rejects_malformed_json():
    with pytest.raises(TranscriptParseError):
        parse_transcript("[{not valid json")


def test_parse_json_rejects_empty_array():
    with pytest.raises(TranscriptParseError):
        parse_transcript("[]")


def test_parse_json_rejects_segment_missing_text():
    with pytest.raises(TranscriptParseError):
        parse_transcript('[{"speaker": "Alex", "start": 0}]')
