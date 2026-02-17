-- Update first hero section with test YouTube URL
UPDATE landing_sections 
SET youtube_url = 'https://www.youtube.com/watch?v=xAR6N9N8e6U'
WHERE section_number = 1;

-- Verify the update
SELECT id, section_number, title, youtube_url FROM landing_sections WHERE section_number = 1;
