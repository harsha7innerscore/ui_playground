{
"mvp_spec": {
"overview": {
"description": "Progressive route-based fetching for subjects → chapters → subchapters → tasks using Redux + mock APIs."
},
"flow": [
{
"step": "Fetch Subjects",
"route": "/route",
"redux_slice": "subjects",
"fetch_condition": "if subjects not in redux then fetch",
"ui_states": ["loading", "error_retry", "empty", "data"],
"on_click": "navigate to /route/{subjectId}"
},
{
"step": "Fetch Chapters for Subject",
"route": "/route/{subjectId}",
"redux_slice": "chaptersBySubject",
"fetch_condition": "if chaptersBySubject[subjectId] not in redux then fetch",
"ui_states": ["loading", "error_retry", "empty", "data"],
"on_click": "navigate to /route/{subjectId}/{chapterId}"
},
{
"step": "Fetch Subchapters for Chapter",
"route": "/route/{subjectId}/{chapterId}",
"redux_slice": "subchaptersByChapter",
"fetch_condition": "if subchaptersByChapter[chapterId] not in redux then fetch",
"ui_states": ["loading", "error_retry", "empty", "data"],
"on_click": "navigate to /route/{subjectId}/{chapterId}/{subchapterId}"
},
{
"step": "Fetch Tasks for Subchapter",
"route": "/route/{subjectId}/{chapterId}/{subchapterId}",
"redux_slice": "tasksBySubchapter",
"fetch_condition": "if tasksBySubchapter[subchapterId] not in redux then fetch",
"ui_states": ["loading", "error_retry", "empty", "data"]
}
],
"additional_info_apis": [
{
"name": "subchapter_attempt_count_per_chapter",
"redux_slice": "attemptCountByChapter",
"fetch_trigger": "when chapter list loads OR chapter route opens",
"usage": "show attempt count beside each chapter"
},
{
"name": "last_attempted_task_per_subchapter",
"redux_slice": "lastAttemptBySubchapter",
"fetch_trigger": "when subchapter list loads OR subchapter route opens",
"usage": "display resume CTA"
}
],
"caching_logic": {
"strategy": "route-aware progressive caching",
"reuse_condition": "if slice data already exists reuse without fetching",
"refetch_condition": "if data missing or stale",
"notes": "optimizes back-forth navigation"
},
"mock_data_strategy": {
"status": "using mock jsons for initial MVP",
"mock_files": [
"subjects.json",
"chaptersBySubject.json",
"subchaptersByChapter.json",
"tasksBySubchapter.json",
"attemptCountByChapter.json",
"lastAttemptBySubchapter.json"
],
"api_layer": "async wrapper simulating network delay"
},
"ui_states": [
{ "state": "loading", "description": "skeleton or spinner" },
{ "state": "error_retry", "description": "show message + retry" },
{ "state": "empty", "description": "no data available" },
{ "state": "data", "description": "render UI" }
],
"routing": [
{ "level": "subjects", "path": "/route" },
{ "level": "chapters", "path": "/route/{subjectId}" },
{ "level": "subchapters", "path": "/route/{subjectId}/{chapterId}" },
{ "level": "tasks", "path": "/route/{subjectId}/{chapterId}/{subchapterId}" }
],
"redux_store_structure": {
"subjects": [],
"chaptersBySubject": {},
"subchaptersByChapter": {},
"tasksBySubchapter": {},
"attemptCountByChapter": {},
"lastAttemptBySubchapter": {},
"status": {
"subjects": "idle",
"chapters": "idle",
"subchapters": "idle",
"tasks": "idle"
}
},
"edge_cases": [
"invalid route → show not-found",
"route exists but data empty → show empty state",
"stale cached data → refetch"
],
"future_enhancements": [
"pagination for huge sets",
"stale-time based cache expiry",
"prefetching on hover",
"transition to real API layer"
],
"meta": {
"author": "MVP Spec for Progressive Subject Flow",
"status": "draft_v1",
"tech_stack": ["React", "Redux Toolkit", "React Router v6"],
"date": "2025-10-28"
}
}
}
