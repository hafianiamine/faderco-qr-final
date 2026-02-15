-- Populate landing sections with sample video URLs
-- Using Pexels/Pixabay free video URLs that support autoplay

UPDATE landing_sections 
SET youtube_url = 'https://videos.pexels.com/video-files/2988874/2988874-sd_640_360_30fps.mp4'
WHERE section_number = 1;

UPDATE landing_sections 
SET youtube_url = 'https://videos.pexels.com/video-files/3571448/3571448-sd_640_360_24fps.mp4'
WHERE section_number = 2;

UPDATE landing_sections 
SET youtube_url = 'https://videos.pexels.com/video-files/3571421/3571421-sd_640_360_24fps.mp4'
WHERE section_number = 3;

-- Verify the updates
SELECT section_number, title, youtube_url FROM landing_sections ORDER BY section_number;
