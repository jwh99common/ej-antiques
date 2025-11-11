ALTER TABLE bens_bikes_blogs
ADD COLUMN status TEXT DEFAULT 'active';

ALTER TABLE bens_bikes_gallery
ADD COLUMN status TEXT DEFAULT 'active';

ALTER TABLE bens_bikes_merchandise
ADD COLUMN status TEXT DEFAULT 'active';

ALTER TABLE bens_bikes_services
ADD COLUMN status TEXT DEFAULT 'active';


