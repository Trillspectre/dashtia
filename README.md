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

## Design & Planning:

### User Stories
User stories:
a few examples of user stories the rest can be views at the [project-board](https://github.com/users/Trillspectre/projects/10)
I want to log out:
![user-story-3](user-story-3.png)
I want the interface to clearly reflect my logged-in or logged-out status across all pages:
![user-story-4](user-story-4.png)
I want to access a form to log new KPI and performance metrics (e.g., tasks completed, time spent):
![user-story-6](user-story-6.png)
I want to view a list of all my past KPI submissions:
![user-story-7](user-story-7.png)
I want to edit a specific KPI entry that I previously submitted
![user-story-8](user-story-8.png) 

### Wireframes
![Wireframes](<staticfiles/Readme img/New Wireframe 1.png>)
### Agile Methodology
User stories:
a few examples of user stories the rest can be views at the [project-board](https://github.com/users/Trillspectre/projects/10)
I want to log out:
![user-story-3](user-story-3.png)
I want the interface to clearly reflect my logged-in or logged-out status across all pages:
![user-story-4](user-story-4.png)
I want to access a form to log new KPI and performance metrics (e.g., tasks completed, time spent):
![user-story-6](user-story-6.png)
I want to view a list of all my past KPI submissions:
![user-story-7](user-story-7.png)
I want to edit a specific KPI entry that I previously submitted
![user-story-8](user-story-8.png)
MoSCoW prioritisation was used alongside three further tags User and Admin where used for Permissions and MVP was attached to all items Originally included in the scope of MVP
![Project-board](project-board.png)
### Typography
Explain font you've used for your project
### Colour Scheme
![Coolers diagram](dashtia.png)
### DataBase Diagram
![alt text](ERD-2025-10-12-143901.png)
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
Navigation bar on the signup page navigate to pricing and home:![signup](sign-up.png) . When logged in with permissions you can view and navigate to My KPIs,Team KPIs, Teams Admin and logout: ![Logged-in](Logged-in.png) 
### Footer
[Footer](footer.png) has copyright, logo and navigation buttons to socials that are not wired up
### Home-page
THe homepage shows a brief overview of the features and is intended to be a landing page for new users
![Home page](Logged-out-homepage.png)
### CRUD
A few pages have Crud capabilities 
The KPI dashboard:
![Crud-KPI-dashboard.png](Crud-KPI-dashboard.png)
Users can create new KPIs, edit and delete existing ones and assign roles <br>
The team management dashboard:
![team-management](team-management.png)
users can create teams view and add members and roles to teams no delete function has been implemented yet<br>
The Kpi view chart and enter data screen:
![Kpi-data-chart](Kpi-data-chart.png)
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

## Testing
Important part of your README!!!
### Google's Lighthouse Performance
#### Lighthouse home page:
 ![alt text](Lighthouse-homepage.png)
 ![alt text](Lighthouse-Kpi-dashboard-desktop.png)
 ![alt text](Lighthouse-Kpi-dashboard-mobile.png)
 ![alt text](Lighthouse-Team-management-Desktop.png)
 ![alt text](Lighthouse-Team-management-Mobile.png)
 ![alt text](Lighthouse-Team-dashboard-Desktop.png)
 ![alt text](Lighthouse-Team-dashboard-Mobile.png)
 ![alt text](Lighthouse-stat-dashboard-Desktop.png)
 ![alt text](Lighthouse-stat-dashboard-Mobile.png)
 
 ### Browser Compatibility
Compatible with  Edge browser, chrome browser and comet browser
### Responsiveness
Pixel 7:
![Pixel 7](Pixel-7.png)
iphone 12 pro:
![Iphone 12 Pro](iphone-12-pro.png)
Samsung-galaxy-s8:
![Samsung-galaxy-s8](Samsung-galaxy-s8.png)
ipad pro:
![ipad-pro](ipad-pro.png)
Am I Responsive:
![amiresponsive](amiresponsive.png)

### Code Validation
Validate your code HTML, CSS, JS & Python (all pages/files need to be validated!!!), display screenshots
### Manual Testing user stories
Test all your user stories, you an create table 
User Story |  Test | Pass
--- | --- | :---:
I want the interface to clearly reflect my logged-in or logged-out status across all pages | After logging in and navigating to any of the tools pages a logged in and role is present | &check;
![alt text](image.png)|
User Story |  Test | Pass
I want to access a form to log new KPI and performance metrics (e.g., tasks completed, time spent) | After navigating to the my Kpi page you can add data as well as dynamically created data and then create a new KPI and view older ones  | &check;
![alt text](image.png)|
User Story |  Test | Pass
I want to view a list of all my past KPI submissions | After navigating to the kpi enter data/view chart button you can view and delete previous entries  | &check;
![Kpi-data-chart](Kpi-data-chart.png)|
User Story |  Test | Pass
I want to edit a specific KPI entry that I previously submitted / I want to delete a KPI log entry I created| After navigating to the my kPIs Kpi can be deleted and edited  | &check;
![Kpi-dashboard-chart](image.png)|![Edit page](image-1.png)|
User Story |  Test | Pass
I want to log out | After clicking logout you are logged out from the platform and returned to the home page the pltaform nav should not be available | &check;
![Logged out](logged-out-homepage)|
User Story |  Test | Pass
I want to create a new team| After navigating to the teams page you can create a new team it will be displayed and you can add members to the team | &check;
![Logged out](team-management.png)|
User Story |  Test | Pass
I want to be prevented from accessing any team creation or modification pages as a standard user| This was not able to be implemented | &cross;
User Story |  Test | Pass
I want to view the Team Productivity Dashboard| After navigating to the team KPIs page you can create view KPIS per team| &check;
!![Team-kpis](Team-kpis.png)|
User Story |  Test | Pass
I want to sign up and register a new account| After navigating to the Home page you can click the signup button and create and account this page is also able to be navigated to from the free tier on the pricing page| &check;
!![Sign-up](sign-up.png)|
User Story |  Test | Pass
Real-Time Notifications | After navigating to the enter data/view chart button from the KPI page. When entering data or when other users enter data the chart redraws and the list adds the data | &check;
![kpi-data-chart](kpi-data-chart.png)|
User Story |  Test | Pass
I want to log in securely | Navigate to the log in page and enter in your details | &check;
![login](Login.png)|

### Manual Testing features
Test all your features, you can use the same approach 
| Feature | Action | Status | 
|:-------:|:--------| :--------|
| description | user steps | &check; |
attach screenshot

## Bugs
List of bugs and how did you fix them

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
List of used resources for your website (text, images, snippets of code, projects....)
