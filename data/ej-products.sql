DELETE FROM ej_antiques_products;
INSERT INTO ej_antiques_products (id, title, description, price, category, image, images, longDescription)
VALUES (1, 'Clarice Cliff ', 'A selection of Clarice Cliff.', 45, 'Ceramics', '/ej-antiques/cc-1.jpg', '["/ej-antiques/cc-1.jpg", "/ej-antiques/cc-2.jpg", "/ej-antiques/cc-3.jpg", "/ej-antiques/cc-4.jpg"]', '');
INSERT INTO ej_antiques_products (id, title, description, price, category, image, images, longDescription)
VALUES (2, 'Antique Swords', 'A selection of Antique Swords', 30, 'Militaria', '/ej-antiques/sw-1.jpg', '["/ej-antiques/sw-2.jpg", "/ej-antiques/sw-3.jpg", "/ej-antiques/sw-4.jpg"]', '' );
INSERT INTO ej_antiques_products (id, title, description, price, category, image, images, longDescription)
VALUES (3, 'Honda Firenza 250CC', 'Limited edition bike, great for the collector.', 25, 'ROAD', '/ej-antiques/bb-yam-3.jpg', '["/ej-antiques/r2-g2.png", "/ej-antiques/r2-g3.png", "/ej-antiques/r2-g4.png"]', ' never been on the road, this limited edition Honda Firenza 250CC is a must-have for collectors. With only a few units ever made, it features unique styling and top-notch performance. Comes with original documentation and accessories.');
INSERT INTO ej_antiques_products (id, title, description, price, category, image, images, longDescription)
VALUES (4, 'KTM 300CC Adventure', 'No better bike for the trails, ready to ride.', 35, 'MTX', '/ej-antiques/bb-yam-4.jpg', '["/ej-antiques/r2-g2.png", "/ej-antiques/r2-g3.png", "/ej-antiques/r2-g4.png"]', 'Captured at dawn in Richmond Park, this macro photograph shows the intricate beauty of morning dew on a spider''s web. Shot with a 100mm macro lens and printed on premium photographic paper. Comes matted and framed.');
INSERT INTO ej_antiques_products (id, title, description, price, category, image, images, longDescription)
VALUES (5, 'THE BOLLOCKS', 'No better bike for the trails, ready to ride.', 60, 'RESTORE', '/ej-antiques/bb-yam-5.jpg', '["/ej-antiques/r2-g2.png", "/ej-antiques/r2-g3.png", "/ej-antiques/r2-g4.png"]', 'Copy goes here');
INSERT INTO ej_antiques_products (id, title, description, price, category, image, images, longDescription)
VALUES (6, 'Suzuki 400CC Classic', 'Great suzuki, good condition, low mileage.', 40, 'MTX', '/ej-antiques/bb-yam-6.jpg', '["/ej-antiques/r2-g2.png", "/ej-antiques/r2-g3.png", "/ej-antiques/r2-g4.png"]', 'Copy goes here');
INSERT INTO ej_antiques_products (id, title, description, price, category, image, images, longDescription)
VALUES (7, 'KTM 300CC Adventure', 'KTM rules the road, great condition, low mileage.', 40, 'ROAD', '/ej-antiques/bb-yam-7.jpg', '["/ej-antiques/r2-g1.png", "/ej-antiques/r2-g2.png", "/ej-antiques/r2-g4.png"]', 'Copy goes here');
SELECT id, title, image, images FROM ej_antiques_products;