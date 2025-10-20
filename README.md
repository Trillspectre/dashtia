# dashtia
## Table Of Contents:
1. [Design & Planning](#design-&-planning)
    * [User Stories](#user-stories)
    * [Wireframes](#wireframes)
    * [Agile Methodology](#agile-methodology)
    * [Typography](#typography)
    * [Colour Scheme](#colour-scheme)
    * [Database Diagram](#database-diagram)
    
2. [Features](#features)
    * [Navigation](#Navigation)
    * [Footer](#Footer)
    * [Home page](#Home-page)
    * [add your pages](#)
    * [CRUD](#CRUD)
    * [Authentication & Authorisation](#Authentication-Authorisation )

3. [Technologies Used](#technologies-used)
4. [Libraries](#libraries-used)
5. [Testing](#testing)
6. [Bugs](#bugs)
7. [Deployment](#deployment)
8. [Credits](#credits)
## Deployed Links
https://dashtia-a4f2cf03bc67.herokuapp.com/
https://github.com/Trillspectre/dashtia
https://github.com/users/Trillspectre/projects/10/views/1
## Design & Planning:

### User Stories
User stories:
a few examples of user stories the rest can be views at the [project-board](https://github.com/users/Trillspectre/projects/10)
I want to log out:
![user-story-3](.github/images/user-story-3.png)
I want the interface to clearly reflect my logged-in or logged-out status across all pages:
![user-story-4](.github/images/user-story-4.png)
I want to access a form to log new KPI and performance metrics (e.g., tasks completed, time spent):
![user-story-6](.github/images/user-story-6.png)
I want to view a list of all my past KPI submissions:
![user-story-7](.github/images/user-story-7.png)
I want to edit a specific KPI entry that I previously submitted
![user-story-8](.github/images/user-story-8.png) 

### Wireframes
![Wireframes](<.github/images/New Wireframe 1.png>)
### Agile Methodology
User stories:
a few examples of user stories the rest can be views at the [project-board](https://github.com/users/Trillspectre/projects/10)
I want to log out:
![user-story-3](.github/images/user-story-3.png)
I want the interface to clearly reflect my logged-in or logged-out status across all pages:
![user-story-4](.github/images/user-story-4.png)
I want to access a form to log new KPI and performance metrics (e.g., tasks completed, time spent):
![user-story-6](.github/images/user-story-6.png)
I want to view a list of all my past KPI submissions:
![user-story-7](.github/images/user-story-7.png)
I want to edit a specific KPI entry that I previously submitted
![user-story-8](.github/images/user-story-8.png)
MoSCoW prioritisation was used alongside three further tags User and Admin where used for Permissions and MVP was attached to all items Originally included in the scope of MVP
![Project-board](.github/images/project-board.png)
### Typography
I have used Nunito across the project as it is clean and keeps a cohesive professional style across the site
### Colour Scheme
![Coolers diagram](.github/images/dashtia.png)
### DataBase Diagram
![alt text](.github/images/ERD-2025-10-12-143901.png)
```
---
config:
  layout: elk
---
erDiagram
    USER {
        int id PK
        string username
        string email
    }
    TEAM {
        int id PK
        string name
        string slug
        text description
        datetime created_at
        boolean is_private
    }
    TEAM_MEMBERSHIP {
        int id PK
        string role
        datetime joined_at
    }
    STATISTIC {
        int id PK
        string name
        string slug
        string unit_type
        string custom_unit
        decimal min_value
        decimal max_value
        string chart_type
        datetime created_at
        string visibility
        boolean is_active
    }
    DATA_ITEM {
        int id PK
        decimal value
        string owner
        datetime timestamp
    }
    KPI_DELETION {
        int id PK
        datetime deleted_at
        text reason
    }
    TEAM ||--o{ TEAM_MEMBERSHIP : "has"
    USER ||--o{ TEAM_MEMBERSHIP : "is_member"
    USER ||--o{ TEAM : "created_by"
    USER ||--o{ STATISTIC : "owner_of"
    STATISTIC }o--o{ TEAM : "visible_to (m2m)"
    STATISTIC ||--o{ DATA_ITEM : "has"
    STATISTIC ||--o{ KPI_DELETION : "has_deletion_records"
    USER ||--o{ KPI_DELETION : "deleted_by"
```

## Features:
Explain your features on the website,(navigation, pages, links, forms, input fields, CRUD....)
### Navigation
Navigation bar on the signup page navigate to pricing and home:![signup](.github/images/sign-up.png) . When logged in with permissions you can view and navigate to My KPIs,Team KPIs, Teams Admin and logout: ![Logged-in](.github/images/Logged-in.png) 
### Footer
[Footer](.github/images/footer.png) has copyright, logo and navigation buttons to socials that are not wired up
### Home-page
THe homepage shows a brief overview of the features and is intended to be a landing page for new users
![Home page](.github/images/Logged-out-homepage.png)
### CRUD
A few pages have Crud capabilities 
The KPI dashboard:
![Crud-KPI-dashboard.png](.github/images/Crud-KPI-dashboard.png)
Users can create new KPIs, edit and delete existing ones and assign roles <br>
The team management dashboard:
![team-management](.github/images/team-management.png)
users can create teams view and add members and roles to teams no delete function has been implemented yet<br>
The Kpi view chart and enter data screen:
![Kpi-data-chart](.github/images/Kpi-data-chart.png)
### Authentication-Authorisation 
Tech |Use 
--- | :---:
allauth | Built in django authentication
allauth.account | Built in django authentication for account roles |
allauth.socialaccount | Built in django authentication for SSO integration not able to be implemented in time| 
## Technologies Used
Tech |Use 
--- | :---:
Channels | handle dynamically updating the charts
Charts   | To draw the charts from the data input
cloudinary_storage | To store files to add to an account not implemented in time
cloudinary | To store files to add to an account not implemented in time
Faker | To generate fake users in testing
## AI use:
Generative AI was used as an aide to build this site:
AI assisted in setting up environment variables to streamline y work flow <br>
AI was used to generate python tests viewable here https://github.com/Trillspectre/dashtia/blob/34309450266d7a52b47ed0c3c0c51402a29b3f75/stats/tests.py<br>
AI was used to generate database smoke tests to test database actions 
## Testing 
### Google's Lighthouse Performance
#### Lighthouse home page:
 ![alt text](.github/images/Lighthouse-homepage.png)
 ![alt text](.github/images/Lighthouse-Kpi-dashboard-desktop.png)
 ![alt text](.github/images/Lighthouse-Kpi-dashboard-mobile.png)
 ![alt text](.github/images/Lighthouse-Team-management-Desktop.png)
 ![alt text](.github/images/Lighthouse-Team-management-Mobile.png)
 ![alt text](.github/images/Lighthouse-Team-dashboard-Desktop.png)
 ![alt text](.github/images/Lighthouse-Team-dashboard-Mobile.png)
 ![alt text](.github/images/Lighthouse-stat-dashboard-Desktop.png)
 ![alt text](.github/images/Lighthouse-stat-dashboard-Mobile.png)
 
 ### Browser Compatibility
Compatible with  Edge browser, chrome browser and comet browser
### Responsiveness
Pixel 7:
![Pixel 7](.github/images/Pixel-7.png)
iphone 12 pro:
![Iphone 12 Pro](.github/images/iphone-12-pro.png)
Samsung-galaxy-s8:
![Samsung-galaxy-s8](.github/images/Samsung-galaxy-s8.png)
ipad pro:
![ipad-pro](.github/images/ipad-pro.png)
Am I Responsive:
![amiresponsive](.github/images/amiresponsive.png)

### Code Validation
#### HTML
HTML landing page
![HTML landing page](<.github/images/HTML landing page validator.png>)
HTML Pricing Pass ✅
![HTML Pricing](<.github/images/HTML Pricing validator.png>)
HTML login Pass ✅
![HTML login](<.github/images/HTML login validator.png>)
HTML signup page Pass ✅
![<HTML signup page](<.github/images/HTML signup page validator.png>)
HTML KPI 
![HTML KPI ](<.github/images/HTML KPI validator.png>)
HTML Dynamic stat Pass ✅
![HTML Dynamic stat](<.github/images/HTML Dynamic stat  validator.png>)
HTML Teams Pass ✅
![HTML Teams](<.github/images/HTML Teams validator.png>)
#### CSS
Animate.css Pass ✅
![Animate.css](<.github/images/CSS animate validator.png>)
bootstrap5 Pass ✅
![bootstrap5.css](<.github/images/CSS bootstrap5 validator.png>)
Lineicons.css Pass ✅
![Lineicons.css](<.github/images/CSS Lineicons validator.png>)
main.css Pass ✅
![main.css](<.github/images/CSS main validator.png>)
#### JS
Unified.bundle.js Pass ✅
![Unified.bundle.js](<.github/images/Unified JS Hint.png>)!
#### Python
consumers.py Pass ✅
![consumers.py](<.github/images/consumers py python linter.png>)
Stats Models.py Pass ✅
![Stats Models.py](<.github/images/stats models py linter.png>)
Stats.forms.py Pass ✅
![Stats forms.py](<.github/images/Stats forms py linter.png>)
Stats routing.py Pass ✅
![Stats routing.py](<.github/images/stats routing py linter.png>)
Stats url.py Pass ✅
![Stats url.py](<.github/images/Stats url py linter.png>)
stats views.py Pass ✅
![stats views.py](<.github/images/stats views py linter.png>)
Stats admin.py
![Stats admin ](<.github/images/Stats admin py linter.png>)
home views.py
![home views](<.github/images/home views py linter.png>)
home url.py
![home url](<.github/images/home url py linter.png>)
config manage.py
![config manage.py](<.github/images/config manage py linter.png>)
config asgi.py
![config asgi.py](<.github/images/config asgi py linter.png>)
### Manual Testing user stories
Test all your user stories, you an create table 
User Story |  Test | Pass
--- | --- | :---:
I want the interface to clearly reflect my logged-in or logged-out status across all pages | After logging in and navigating to any of the tools pages a logged in and role is present | &check;
![alt text](.github/images/kpi-dash.png)|
User Story |  Test | Pass
I want to access a form to log new KPI and performance metrics (e.g., tasks completed, time spent) | After navigating to the my Kpi page you can add data as well as dynamically created data and then create a new KPI and view older ones  | &check;
![alt text](.github/images/kpi-dash.png)|
User Story |  Test | Pass
I want to view a list of all my past KPI submissions | After navigating to the kpi enter data/view chart button you can view and delete previous entries  | &check;
![Kpi-data-chart](.github/images/Kpi-data-chart.png)|
User Story |  Test | Pass
I want to edit a specific KPI entry that I previously submitted / I want to delete a KPI log entry I created| After navigating to the my kPIs Kpi can be deleted and edited  | &check;
![Kpi-dashboard-chart](.github/images/kpi-dash.png)|![Edit page](.github/images/kpi-dash-edit.png)|
User Story |  Test | Pass
I want to log out | After clicking logout you are logged out from the platform and returned to the home page the platform nav should not be available | &check;
![Logged out](.github/images/Logged-out-homepage.png)|
User Story |  Test | Pass
I want to create a new team| After navigating to the teams page you can create a new team it will be displayed and you can add members to the team | &check;
![Team-kpis](.github/images/team-management.png)|
User Story |  Test | Pass
I want to be prevented from accessing any team creation or modification pages as a standard user| This was not able to be implemented | &cross;
User Story |  Test | Pass
I want to view the Team Productivity Dashboard| After navigating to the team KPIs page you can create view KPIS per team| &check;
![Team-kpis](.github/images/Team-kpis.png)|
User Story |  Test | Pass
I want to sign up and register a new account| After navigating to the Home page you can click the signup button and create and account this page is also able to be navigated to from the free tier on the pricing page| &check;
!![Sign-up](.github/images/sign-up.png)|
User Story |  Test | Pass
Real-Time Notifications | After navigating to the enter data/view chart button from the KPI page. When entering data or when other users enter data the chart redraws and the list adds the data | &check;
![kpi-data-chart](.github/images/Kpi-data-chart.png)|
User Story |  Test | Pass
I want to log in securely | Navigate to the log in page and enter in your details | &check;
![login](.github/images/Login.png)|

### Manual Testing features
Test all your features, you can use the same approach 
| Feature | Action | Status | 
|:-------:|:--------| :--------|
| Front page | Users can navigate the front page | &check; |
![Front page feature](<.github/images/Front page feature.gif>) |
| team kpis page | Users can navigate to the team kpis page and select their team from there they can navigate to there KPIs | &check; |
![team kpis page](<.github/images/team kpis page feature.gif>) |
| pricing kpis page | Users can navigate to the pricing page read more and use the sign up on the free tier to make an account| &check; |
![pricing page](<.github/images/pricing kpis page feature.gif>) |
| create teams and add members data feature | Users can navigate the teams page. On this page they can create a team set its visibility and add members, They can also add members to existing teams | &check; |
![create teams and add members data feature](<.github/images/create teams and add members data feature.gif>) |
| Front page | Users can navigate the Kpis page. From there they can view Kpis and create and customisekpis from this page they can navigate to the chart of each KPI and enter data the chart dynamically updates | &check; |
![create kpis and add data](<.github/images/create kpis and add data feature.gif>) |

## Bugs
These are Bugs that still exist in the site and will be iterated outside the scope of the project.
Team modal navigation:
The navigation away from a team modal is currently broken and can only be navigated away from by clicking away from the modal
Team members cannot be removed from teams

Chart data deletion update: 
The chart does not update when items are deleted and only available when refreshed
The data delete X does not appear when a new item is populated after entering the data, it only appears after refresh

Permissions:
The permission structure needs another pass to ensure navigation menus and actions are hidden from user without the relevant permissions

As it stands the users would benefit from an account management page to change account details.

The SSO sign in options have not been completed


## Deployment
[Deployed site](https://dashtia-a4f2cf03bc67.herokuapp.com/)
This website is deployed to Heroku from a GitHub repository, the following steps were taken:

#### Creating Repository on GitHub
- First make sure you are signed into [Github](https://github.com/) and go to the code institutes template, which can be found [here](https://github.com/Code-Institute-Org/gitpod-full-template).
- Then click on **use this template** and select **Create a new repository** from the drop-down. Enter the name for the repository and click **Create repository from template**.
- Once the repository was created, I clicked the green **gitpod** button to create a workspace in gitpod so that I could write the code for the site.

#### Creating an app on Heroku
- After creating the repository on GitHub, head over to [heroku](https://www.heroku.com/) and sign in.
- On the home page, click **New** and **Create new app** from the drop down.
- Give the app a name(this must be unique) and select a **region** I chose **Europe** as I am in Europe, Then click **Create app**.

#### Create a database 
- Log into [CIdatabase maker](https://www.heroku.com/](https://dbs.ci-dbs.net/))
- add your email address in input field and submit the form
- open database link in your email
- paste database URL in your DATABASE_URL variable in env.py file and in Heroku config vars

#### Deploying to Heroku.
- Head back over to [heroku](https://www.heroku.com/) and click on your **app** and then go to the **Settings tab**
- On the **settings page** scroll down to the **config vars** section and enter the **DATABASE_URL** which you will set equal to the elephantSQL URL, create **Secret key** this can be anything,
**CLOUDINARY_URL** this will be set to your cloudinary url and finally **Port** which will be set to 8000.
- Then scroll to the top and go to the **deploy tab** and go down to the **Deployment method** section and select **Github** and then sign into your account.
- Below that in the **search for a repository to connect to** search box enter the name of your repository that you created on **GitHub** and click **connect**
- Once it has been connected scroll down to the **Manual Deploy** and click **Deploy branch** when it has deployed you will see a **view app** button below and this will bring you to your newly deployed app.
- Please note that when deploying manually you will have to deploy after each change you make to your repository.
## Credits
Build Real-Time Live Dashboards with Django Channels: A Step-by-Step Tutorial 
 https://www.youtube.com/watch?v=jsxFEONN_yo&t=486s
 <br>startbootstrap.com free themes 
 <br>mermaidchart.com ERD
 Code Institute and its staff who have helped me le


 ## Conclusion

 The project falls short of My original scope and I would like to work further to rectify bugs and make the user experience more signposted with a possible tutorial for each page.

 I had initially built all the javascript in one file but as it grew I looked into a way to break it up. I found a method to separate the functions into separate files and to compile it via NPM/node.js unfortunately I didn't have enough time to implement it fully and would like to explore this further

 Research needs to be made to investigate how to implement the Dashtia solution in a contained cohort per company. As it stands today it is just designed to be used by one company and as such all administrative functions are site wide (i.e admins can see all users and KPIs)

 Ultimately I am happy with the project and its application. At this stage it is a proof of concept of a SaaS website targeting SMEs  