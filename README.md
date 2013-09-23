geoserv
=========
Ronaldo Barbachano 2013

Forked from geoserve, designed to make use of most of Instagram's geo location features. Does basic oauth login (needs some work), and then runs mostly server side calls that passes the key to retreve data. Data is stored server side and sent back to client using publish/subscribe. A users posts are always unique, locations and posts related to public locations are not.

Basic use of the application is inside of client/templates/nav.html, you must first  which you may then .

**How to use**

1) Register a instagram API key and callback url

2) Edit settings-example.json with these values.

3) Run 'meteor --settings settings-example.json' or 'meteor deploy <address> --settings settings-example.json'


**Known Issues**

A lot of marker location searches won't return any values

**Road Map**

Ability to do geojson queries on data. Allow users to filter by tag.. support realtime api endpoints.
