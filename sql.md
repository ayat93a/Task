CREATE TABLE retrieved_from_third_party_api (
contry_id SERIAL PRIMARY KEY,
commonName VARCHAR ,
officialName VARCHAR ,
nativeName_official VARCHAR ,
nativeName_common VARCHAR ,
Languages VARCHAR ,
cca2 VARCHAR ,
cca3 VARCHAR ,
ccn3 VARCHAR ,
Currencies_name VARCHAR ,
Currencies_symbol VARCHAR ,
Region VARCHAR ,
latitude_ VARCHAR ,
longitude_ VARCHAR 
)

CREATE TABLE languages (
lan_id SERIAL PRIMARY KEY,
lan0 VARCHAR,
lan1 VARCHAR,
lan2 VARCHAR,
lan3 VARCHAR,
lan4 VARCHAR,
lan5 VARCHAR,
lan6 VARCHAR,
lan7 VARCHAR,
lan8 VARCHAR,
lan9 VARCHAR,
lan10 VARCHAR,
lan11 VARCHAR,
lan12 VARCHAR,
lan13 VARCHAR,
lan14 VARCHAR
)



