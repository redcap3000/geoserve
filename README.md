geoserv
=========
Ronaldo Barbachano 2013

An easy to use geolocation using GMaps Geocoder; originally intended to be used to connect at-risk populations with local services (hospitals, clinics, shelters, lawyers)

Uses Meteor .js.

Currently allows users to create and edit only their own records. Other users/ the general public can see these records as well. Users can add any number of 'Services' which they can also define, to new 'markers' that refer to a geolocated service.

**How to use**

1) Create an account

2) Press the 'Star' icon to  get to the new marker screen.

3) Enter a title, select a marker type, and then enter in the exact address.

4) Next click the 'globe' icon to pull up markers, click the title in the menu to
   center the location and pull up the editor screen.
   
   
**Defining your own services**

1) From any marker editor screen type in the name of the service you'd like to add in the textbox with 'New Service' in it and press 'New Service'/

2) You may now begin to select this service to add to any of your markers, by selecting it from the list and pressing 'Add Service'.


**Roadmap**

This is a rough release. But support for agencies, referral group codes will be added as basic interface stuff is improved. Would also like to add the ability for people to 'take ownership' over a marker and have a more rhobust page that has more information about that location and its services.

**Known Issues**

Deleting a marker does not delete its associated services. The same service may be added to the same marker. When adding new services a check is not made to see the service does not already exist.

