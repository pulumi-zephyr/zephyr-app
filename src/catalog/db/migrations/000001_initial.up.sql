CREATE TABLE IF NOT EXISTS product (
	product_id varchar(40) NOT NULL, 
	name varchar(20), 
	description varchar(200), 
	price int, 
	count int, 
	image_url varchar(40), 
	PRIMARY KEY(product_id)
);

CREATE TABLE IF NOT EXISTS tag (
	tag_id MEDIUMINT NOT NULL AUTO_INCREMENT, 
	name varchar(20),
  display_name varchar(20), 
	PRIMARY KEY(tag_id)
);

CREATE TABLE IF NOT EXISTS product_tag (
	product_id varchar(40), 
	tag_id MEDIUMINT NOT NULL, 
	FOREIGN KEY (product_id) 
		REFERENCES product(product_id), 
	FOREIGN KEY(tag_id)
		REFERENCES tag(tag_id)
);

INSERT INTO product VALUES ("6d62d909-f957-430e-8689-b5129c0bb75e", "Arcane Staff", "A ray of the morning sun made manifest. Pale yet golden, writhing with the emancipated palette of a spring long forgotten.", 385, 33, "/assets/staff.png");
INSERT INTO product VALUES ("a0a4f044-b040-410d-8ead-4de0446aec7e", "Globe", "An orrery of infinitesimal precision of all the knowns, half knowns and unknowns of terrestrial realities and waking dreams.", 50, 115, "/assets/globe.png");
INSERT INTO product VALUES ("808a2de1-1aaa-4c25-a9b9-6612e8f29a38", "Anti-Gravity Saucer", "Forgoing terrestrial land for the hollows of the gods. A chariot to exist in the waldeinsamkeit of the reaches and chasms.",  5100, 9, "/assets/anti-grav-saucer.png");
INSERT INTO product VALUES ("510a0d7e-8e83-4193-b483-e27e09ddc34d", "Portal Gun", "For travels beyond storied time, fanned by the lust of charting the uncharted and naming the nameless.",  795, 51, "/assets/portal-gun.png");
INSERT INTO product VALUES ("ee3715be-b4ba-11ea-b3de-0242ac130004", "Power Glove", "August machine spirits brought low, forever entombed as a gauntlet of familiar sentience.",  650, 9, "/assets/glove.png");
INSERT INTO product VALUES ("f4ebd070-b4ba-11ea-b3de-0242ac130004", "Flux Capacitor", "Power overwhelming.  An unfathomable well of arcane energies.",  1800, 76, "/assets/flux-capacitor.png");

INSERT INTO tag (name, display_name) VALUES ("vehicle", "Vehicle");
INSERT INTO tag (name, display_name) VALUES ("energy", "Energy");
INSERT INTO tag (name, display_name) VALUES ("apparatus", "Apparatus");
INSERT INTO tag (name, display_name) VALUES ("exotic", "Exotic");

INSERT INTO product_tag VALUES ("6d62d909-f957-430e-8689-b5129c0bb75e", "2");
INSERT INTO product_tag VALUES ("a0a4f044-b040-410d-8ead-4de0446aec7e", "4");
INSERT INTO product_tag VALUES ("808a2de1-1aaa-4c25-a9b9-6612e8f29a38", "1");
INSERT INTO product_tag VALUES ("808a2de1-1aaa-4c25-a9b9-6612e8f29a38", "3");
INSERT INTO product_tag VALUES ("510a0d7e-8e83-4193-b483-e27e09ddc34d", "3");
INSERT INTO product_tag VALUES ("ee3715be-b4ba-11ea-b3de-0242ac130004", "2");
INSERT INTO product_tag VALUES ("ee3715be-b4ba-11ea-b3de-0242ac130004", "3");
INSERT INTO product_tag VALUES ("f4ebd070-b4ba-11ea-b3de-0242ac130004", "2");
INSERT INTO product_tag VALUES ("f4ebd070-b4ba-11ea-b3de-0242ac130004", "3");