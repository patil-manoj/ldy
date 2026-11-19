-- Wash Nest price catalog: washing, ironing, and dry cleaning
truncate table public.prices restart identity;

insert into public.prices
  (id, service_type, item_name, category, price, price_per_kg, is_per_kg, minimum_kg, active)
values
  -- Washing
  (1, 'wash_fold', 'Mixed Clothes', 'clothing', 0, 80, true, 5, true),
  (2, 'wash_fold', 'Bedsheet (up to 5 kg)', 'bedding', 400, NULL, false, NULL, true),
  (3, 'wash_fold', 'Blanket (Double)', 'bedding', 350, NULL, false, NULL, true),
  (4, 'wash_fold', 'Blanket (Single)', 'bedding', 300, NULL, false, NULL, true),
  (5, 'wash_fold', 'Comforter', 'bedding', 400, NULL, false, NULL, true),
  (6, 'wash_fold', 'Curtain (up to 5 kg)', 'household', 400, NULL, false, NULL, true),
  (7, 'wash_fold', 'Soft Toys (up to 4 kg)', 'household', 350, NULL, false, NULL, true),
  (8, 'wash_fold', 'Sofa Covers (up to 4 kg)', 'household', 350, NULL, false, NULL, true),
  (9, 'wash_fold', 'Door Mats (up to 4 kg)', 'household', 400, NULL, false, NULL, true),
  (10, 'wash_fold', 'Shoes - Washing (1 pair)', 'household', 250, NULL, false, NULL, true),
  (11, 'wash_fold', 'Floor Carpet', 'household', 30, NULL, false, NULL, true),

  -- Ironing
  (12, 'iron', 'Pant', 'clothing', 15, NULL, false, NULL, true),
  (13, 'iron', 'Shirt', 'clothing', 15, NULL, false, NULL, true),
  (14, 'iron', 'Chudidhar (3 pcs)', 'clothing', 60, NULL, false, NULL, true),
  (15, 'iron', 'Top Single', 'clothing', 20, NULL, false, NULL, true),
  (16, 'iron', 'Bottom', 'clothing', 15, NULL, false, NULL, true),
  (17, 'iron', 'Saree', 'clothing', 60, NULL, false, NULL, true),
  (18, 'iron', 'Blouse', 'clothing', 10, NULL, false, NULL, true),
  (19, 'iron', 'Dhoti Cotton', 'clothing', 25, NULL, false, NULL, true),
  (20, 'iron', 'Dhoti Silk', 'clothing', 30, NULL, false, NULL, true),
  (21, 'iron', 'Bed Sheet Single', 'bedding', 40, NULL, false, NULL, true),
  (22, 'iron', 'Bed Sheet Double', 'bedding', 50, NULL, false, NULL, true),
  (23, 'iron', 'Curtains (Small)', 'household', 80, NULL, false, NULL, true),
  (24, 'iron', 'Curtains (Big)', 'household', 100, NULL, false, NULL, true),
  (25, 'iron', 'Pillow Cover', 'bedding', 10, NULL, false, NULL, true),
  (26, 'iron', 'Towel', 'household', 15, NULL, false, NULL, true),
  (27, 'iron', 'Pajama Suit', 'clothing', 50, NULL, false, NULL, true),
  (28, 'iron', 'Blazer', 'clothing', 50, NULL, false, NULL, true),
  (29, 'iron', 'Waistcoat', 'clothing', 30, NULL, false, NULL, true),
  (30, 'iron', 'Dupatta', 'clothing', 25, NULL, false, NULL, true),
  (31, 'iron', 'Skirts', 'clothing', 50, NULL, false, NULL, true),
  (32, 'iron', 'Bridal Gown', 'clothing', 120, NULL, false, NULL, true),
  (33, 'iron', 'Long Frock', 'clothing', 40, NULL, false, NULL, true),
  (34, 'iron', 'Anarkali', 'clothing', 60, NULL, false, NULL, true),
  (35, 'iron', 'Sofa Cover', 'household', 30, NULL, false, NULL, true),
  (36, 'iron', 'Kids Dress (Boys) - Each', 'clothing', 10, NULL, false, NULL, true),
  (37, 'iron', 'Kids Dress (Girls) - Each', 'clothing', 15, NULL, false, NULL, true),

  -- Dry cleaning - women's wear
  (38, 'dry_clean', 'Tops', 'clothing', 175, NULL, false, NULL, true),
  (39, 'dry_clean', 'Saree', 'clothing', 300, NULL, false, NULL, true),
  (40, 'dry_clean', 'Blouse', 'clothing', 150, NULL, false, NULL, true),
  (41, 'dry_clean', 'Dupatta', 'clothing', 150, NULL, false, NULL, true),
  (42, 'dry_clean', 'Anarkali', 'clothing', 350, NULL, false, NULL, true),
  (43, 'dry_clean', 'Bridal Gown', 'clothing', 450, NULL, false, NULL, true),
  (44, 'dry_clean', 'Skirt', 'clothing', 150, NULL, false, NULL, true),
  (45, 'dry_clean', 'Salwar Kameez (2 pcs)', 'clothing', 250, NULL, false, NULL, true),
  (46, 'dry_clean', 'Salwar Kameez (3 pcs)', 'clothing', 350, NULL, false, NULL, true),
  (47, 'dry_clean', 'Regular Kids Wear', 'clothing', 200, NULL, false, NULL, true),
  (48, 'dry_clean', 'Long Frock', 'clothing', 350, NULL, false, NULL, true),

  -- Dry cleaning - household
  (49, 'dry_clean', 'Bed Sheet Single', 'bedding', 250, NULL, false, NULL, true),
  (50, 'dry_clean', 'Bed Sheet Double', 'bedding', 350, NULL, false, NULL, true),
  (51, 'dry_clean', 'Single Blanket', 'bedding', 400, NULL, false, NULL, true),
  (52, 'dry_clean', 'Double Blanket', 'bedding', 500, NULL, false, NULL, true),
  (53, 'dry_clean', 'Jumbo Blanket', 'bedding', 600, NULL, false, NULL, true),
  (54, 'dry_clean', 'Soft Toy', 'household', 250, NULL, false, NULL, true),
  (55, 'dry_clean', 'School Bag', 'household', 250, NULL, false, NULL, true),
  (56, 'dry_clean', 'Curtains up to 4 feet', 'household', 150, NULL, false, NULL, true),
  (57, 'dry_clean', 'Curtains up to 7 feet', 'household', 250, NULL, false, NULL, true),
  (58, 'dry_clean', 'Curtains up to 10 feet', 'household', 450, NULL, false, NULL, true),
  (59, 'dry_clean', 'Curtains up to 12 feet', 'household', 550, NULL, false, NULL, true),
  (60, 'dry_clean', 'Pillow', 'bedding', 350, NULL, false, NULL, true),

  -- Dry cleaning - men's wear
  (61, 'dry_clean', 'Pants', 'clothing', 150, NULL, false, NULL, true),
  (62, 'dry_clean', 'Shirts', 'clothing', 150, NULL, false, NULL, true),
  (63, 'dry_clean', 'Dhoti', 'clothing', 150, NULL, false, NULL, true),
  (64, 'dry_clean', 'Pyjama Set', 'clothing', 300, NULL, false, NULL, true),
  (65, 'dry_clean', 'Suit (2 pcs)', 'clothing', 350, NULL, false, NULL, true),
  (66, 'dry_clean', 'Suit (3 pcs)', 'clothing', 450, NULL, false, NULL, true),
  (67, 'dry_clean', 'Blazer', 'clothing', 300, NULL, false, NULL, true),
  (68, 'dry_clean', 'Jerkin / Jacket', 'clothing', 300, NULL, false, NULL, true),
  (69, 'dry_clean', 'Leather Jacket', 'clothing', 450, NULL, false, NULL, true),
  (70, 'dry_clean', 'Waistcoat', 'clothing', 200, NULL, false, NULL, true);

select setval(pg_get_serial_sequence('public.prices', 'id'), coalesce((select max(id) from public.prices), 1));
