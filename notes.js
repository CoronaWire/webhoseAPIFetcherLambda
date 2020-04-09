/*

Here are the News Sources that we're targeting that are not available / queryable through the News API

**Listed by category: P1, P2, and P3.** 

**News sources within P1 are ranked in terms of priority.**
**P1**
(Y) SF Chronicle
(Y) Seattle Times
(Y) NY Times
> (N) Tacoma News Tribune
(Y) The Mercury News
(Y) CALMatters
(Y) Los Angeles Times
(Y) Stat News
> (N) The Olympian

P2
==
(Y) East Bay Times
(Y) ABC 7 News
(Y) KRON 4
(Y) NBC Bay Area
(Y) KTVU
> (N) KPIX
(Y) KQED
(Y) KOMO News (ABC 4)
(Y) King 5 News (NBC)
(Y) Kiro7 (CBS)
(Y) KUOW (NPR)

P3
==
(Y) Sacramento Bee
(Y) NPR
(Y) The Guardian
(Y) The Japan Times
> (N) The Financial Times

CREATE TABLE ModerationTable (
                ID           SERIAL NOT NULL, 
[uuid]          ARTICLE_ID   VARCHAR(255) PRIMARY KEY NOT NULL UNIQUE, 
    
[title]         TITLE        VARCHAR(255) NOT NULL, 
[author]        AUTHOR       VARCHAR(255),
[thread.site]   SOURCE_ID    VARCHAR(255) NOT NULL, 
[url]           ARTICLE_URL  VARCHAR(255),
[thread.main_image]    IMAGE_URL    VARCHAR(255),
[text]          CONTENT      TEXT NOT NULL, 
                SUMMARY      TEXT,
                CATEGORY     TEXT[],
              
                POSITIVITY   INT,
                MOD_STATUS   VARCHAR(255),
                BOOST_FACTOR FLOAT8,
                FEATURED     BOOL,
                
                SPECIFICITY  VARCHAR(255),
                COUNTRY      VARCHAR(255),
                REGION       VARCHAR(255),
                CITY         VARCHAR(255),
                LATLONG      POINT,
              
[published]     PUBLISHED_AT TIMESTAMP,
                CREATED_AT   TIMESTAMP NOT NULL DEFAULT NOW(), 
                CREATED_BY   VARCHAR(255),
                UPDATED_AT   TIMESTAMP DEFAULT NOW(),
                UPDATED_BY   VARCHAR(255),
              
                NUM_CLICKS   INT,
                METADATA     JSON
              );

*/