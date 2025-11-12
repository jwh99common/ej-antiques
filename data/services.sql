DELETE FROM bens_bikes_services;

INSERT INTO bens_bikes_services (id, title, description, long_description, image, price, category) VALUES (1, 'Find a Bike', 'Use my extensive network to find your perfect bike.', '', '/r2-images/bb-services-1.jpg', 50, 'Find');
INSERT INTO bens_bikes_services (id, title, description, long_description, image, price, category) VALUES (2, 'Fix A Bike', 'We can fix your bike, Road || MTX || Scooter || Quad || Off-Road', '', '/r2-images/bb-services-2.jpg', 75, 'Fix');
INSERT INTO bens_bikes_services (id, title, description, long_description, image, price, category) VALUES (3, 'Recommend a Bike', 'We can look at your needs and recommend a bike.', '', '/r2-images/bb-services-3.jpg', 50, 'Recommend');
INSERT INTO bens_bikes_services (id, title, description, long_description, image, price, category) VALUES (4, 'Recover/Transport a Bike', 'Broken down at the track, need a lift to the track', '', '/r2-images/bb-services-4.jpg', 50, 'Pick');
INSERT INTO bens_bikes_services (id, title, description, long_description, image, price, category) VALUES (5, 'Green Laning', 'We can take you on a Green Lane Expedition, we know lots or routes in bedfordshire.', '', '/r2-images/bb-services-5.jpg', 100, 'ADventure');

SELECT * FROM bens_bikes_services;