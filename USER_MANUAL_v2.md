# MKFF Web Monitoring System
## User Manual

---

**System Name:** MKFF Web Monitoring System
**Version:** 1.0

---

## TABLE OF CONTENTS

1.0 General Information
- 1.1 System Overview
- 1.2 Help Desk

2.0 System Summary
- 2.1 Hardware and Software Requirements
- 2.2 User Access Level
  - 2.2.1 Administrator Access Level
  - 2.2.2 IT Assistant Access Level
  - 2.2.3 Operator Access Level

3.0 Installation
- 3.1 Software Prerequisites
- 3.2 Installation Process
  - 3.2.1 Install XAMPP
  - 3.2.2 Setup the Database
  - 3.2.3 Configure the Backend
  - 3.2.4 Install Node.js and Frontend Dependencies
  - 3.2.5 Run the System

4.0 Using the System
- 4.1 Login
- 4.2 Administrator's Module
  - 4.2.1 Login
  - 4.2.2 Dashboard
    - 4.2.2.1 Summary Cards
    - 4.2.2.2 Line Health Status
    - 4.2.2.3 Throughput Trend Chart
    - 4.2.2.4 First Pass Yield (FPY)
    - 4.2.2.5 Generate Shift Report
    - 4.2.2.6 AI Critical Station Diagnosis
  - 4.2.3 Stations Overview
    - 4.2.3.1 AI Station Diagnostic
      - 4.2.3.1.1 Root Cause
      - 4.2.3.1.2 Impact Forecast
      - 4.2.3.1.3 Action Items (Delay Resolution)
    - 4.2.3.2 Station Cards Grid
    - 4.2.3.3 Station Monitor
    - 4.2.3.4 Station Checklist
  - 4.2.4 Reports
    - 4.2.4.1 Filter Reports by Date and Station
    - 4.2.4.2 View Report Details
  - 4.2.5 Approval Queue
    - 4.2.5.1 View Pending Units
    - 4.2.5.2 Approve a Unit
  - 4.2.6 No Good Units
    - 4.2.6.1 View NG Units
    - 4.2.6.2 Edit NG Unit
  - 4.2.7 Shipment
    - 4.2.7.1 View Units Ready for Dispatch
    - 4.2.7.2 Dispatch a Unit
  - 4.2.8 Inventory
    - 4.2.8.1 View Inventory
    - 4.2.8.2 Search Inventory
  - 4.2.9 Announcements
    - 4.2.9.1 Post an Announcement
    - 4.2.9.2 Delete an Announcement
  - 4.2.10 User Management
    - 4.2.10.1 View Users
    - 4.2.10.2 Add a User
    - 4.2.10.3 Edit a User
    - 4.2.10.4 Delete a User
  - 4.2.11 Notifications
    - 4.2.11.1 Unit Delay Alert
    - 4.2.11.2 Quality Alert (No Good)
    - 4.2.11.3 Dismiss Notifications
  - 4.2.12 Settings
    - 4.2.12.1 Configure Station Thresholds
    - 4.2.12.2 View Release PIN
    - 4.2.12.3 Reset Release PIN
- 4.3 IT Assistant's Module
  - 4.3.1 Login
  - 4.3.2 Overview Dashboard
  - 4.3.3 QR Code Generator
    - 4.3.3.1 Generate QR Codes
    - 4.3.3.2 Print / Save QR Codes
  - 4.3.4 Station Monitor
    - 4.3.4.1 Live Monitoring Table
    - 4.3.4.2 Unscanned Units Table
  - 4.3.5 Approvals
    - 4.3.5.1 View Pending Units
    - 4.3.5.2 Approve a Unit
  - 4.3.6 Reports
    - 4.3.6.1 Filter Reports
    - 4.3.6.2 View Report Details
  - 4.3.7 Announcements
  - 4.3.8 Notifications
- 4.4 Operator's Module
  - 4.4.1 Login
  - 4.4.2 Home Dashboard
  - 4.4.3 Unit Entry
    - 4.4.3.1 Scan QR Code
    - 4.4.3.2 Update Unit Status
  - 4.4.4 Unit List Table
    - 4.4.4.1 View Current Units
    - 4.4.4.2 Edit a Unit
  - 4.4.5 Unit History Log
  - 4.4.6 Daily Report
    - 4.4.6.1 Submit Daily Report
  - 4.4.7 Announcements
  - 4.4.8 Notifications

---

## 1.0 General Information

### 1.1 System Overview

The MKFF Web Monitoring System is a web-based production tracking and monitoring application designed to oversee the manufacturing process of electronic units across 15 production stations. It provides real-time visibility into unit status, station performance, and production metrics to ensure quality control and operational efficiency on the production floor.

The system features real-time data polling every 1 second, QR code-based unit tracking, role-based access control for three user types (Administrator, IT Assistant, and Operator), automated delay and quality alert notifications, AI-powered production diagnostics, and comprehensive daily reporting capabilities. It monitors the complete production lifecycle from PCB Pairing at Station 1 through QC Stamping at Station 15.

Built with React for the frontend, PHP for the backend, and MySQL as the database, the system runs on XAMPP/Apache and supports multiple concurrent users across different production stations. It includes cross-tab session synchronization and automatic real-time updates so all users always see the latest production data without manually refreshing the page.

*[Insert screenshot of the main system interface here]*

### 1.2 Help Desk

For any technical issues, questions, or system-related concerns regarding the MKFF Web Monitoring System, please contact the support team through the following channels:

**Technical Support Contact:**
- **Email:** [your-support-email@example.com]
- **Phone:** [Your Contact Number]
- **Office Hours:** Monday to Friday, 8:00 AM – 5:00 PM

**Common Issues and Who to Contact:**
- Login problems or forgotten passwords → Contact the IT Administrator
- Database connection errors or data not loading → Contact the System Administrator
- Hardware or network issues (scanner not working, page not loading) → Contact the IT Support Desk
- Feature requests or system improvements → Submit to the Project Team Lead

*[Insert support contact card or helpdesk screenshot here if available]*

---

## 2.0 System Summary

### 2.1 Hardware and Software Requirements

**Minimum Hardware and Software Specification**

**Hardware and Software Specification (for Client):**
- Processor: Intel Core i3 or higher
- RAM: 4 GB
- Hard Drive: 500 MB free disk space
- Output Devices: Monitor, Printer (optional for reports)
- Input Devices: Mouse, Keyboard, USB or Bluetooth Barcode/QR Scanner (required for Operators)
- Operating System: Windows 10 or later
- Internet Browser: Google Chrome, Microsoft Edge, Mozilla Firefox (latest versions)
- Other Applications: None required

**Hardware and Software Specification (for Server):**
- Processor: Intel Core i5 or higher
- RAM: 8 GB or more
- Hard Drive: 10 GB free disk space
- Operating System: Windows 10 / Windows 11
- Web Server: Apache 2.4.x (included in XAMPP)
- Database: MySQL 5.7 or later
- MySQL Web Management: phpMyAdmin (included in XAMPP)
- PHP Version: PHP 7.4 or later
- Runtime Environment: Node.js v16.x or later (for running the React frontend)
- Internet Browser: Google Chrome (recommended)

### 2.2 User Access Level

The MKFF Web Monitoring System uses role-based access control (RBAC) to ensure each user can only access the features relevant to their responsibilities. Every user account is assigned one of three access levels: Administrator, IT Assistant, or Operator. Upon login, the system automatically redirects the user to their role-specific dashboard and restricts access to unauthorized sections.

#### 2.2.1 Administrator Access Level

The Administrator has full access to all modules and features of the system. This role is responsible for overall production oversight, user management, and system configuration. The Administrator can view all 15 stations, manage users, post announcements, approve units, dispatch shipments, and configure system settings.

**Login Credentials for Administrator:**
- Username: admin1 *(replace with your actual default admin username)*
- Password: *(replace with your actual admin password)*

#### 2.2.2 IT Assistant Access Level

The IT Assistant is responsible for generating QR code labels for new production batches and monitoring the overall production line. This role can approve units flagged as Pending Approval but cannot manage users or change system settings.

**Login Credentials for IT Assistant:**
- Username: itassist1 *(replace with your actual IT Assistant username)*
- Password: *(replace with your actual IT Assistant password)*

#### 2.2.3 Operator Access Level

The Operator is assigned to one specific production station. This role handles day-to-day unit scanning and processing at their station. Operators can only view and update units at their assigned station and submit daily shift reports.

**Login Credentials for Operator:**
- Username: operator1 *(replace with your actual Operator username)*
- Password: *(replace with your actual Operator password)*

---

## 3.0 Installation

### 3.1 Software Prerequisites

Before installing the MKFF Web Monitoring System, make sure the following software is available on the host machine:

- XAMPP v8.x or later — includes Apache, MySQL, and PHP. Download from: https://www.apachefriends.org
- Node.js v16.x or later — required to run the React frontend. Download from: https://nodejs.org
- Google Chrome or Microsoft Edge (latest version)
- phpMyAdmin — automatically included with XAMPP

### 3.2 Installation Process

#### 3.2.1 Install XAMPP

**Step 1:** Open any web browser.

**Step 2:** Go to https://www.apachefriends.org and download the XAMPP installer for Windows.

**Step 3:** Run the downloaded installer file. Follow the on-screen instructions. When prompted to choose components, make sure **Apache** and **MySQL** are selected.

**Step 4:** Complete the installation. The default installation path is `C:\xampp`.

**Step 5:** Open the **XAMPP Control Panel** from the Start Menu or desktop shortcut.

**Step 6:** Click **Start** next to **Apache** and **MySQL**. Both should show a green running status.

**Step 7:** Open a browser and go to `http://localhost` to verify XAMPP is working. The XAMPP dashboard page should appear.

*[Insert screenshot of the XAMPP Control Panel with Apache and MySQL running]*

#### 3.2.2 Setup the Database

**Step 1:** Open any web browser.

**Step 2:** Go to `http://localhost/phpmyadmin`. The phpMyAdmin dashboard will appear.

**Step 3:** Click **New** on the left panel to create a new database.

**Step 4:** Type `mkff` as the database name and click **Create**.

**Step 5:** Click on the `mkff` database in the left panel, then click the **Import** tab at the top.

**Step 6:** Click **Choose File** and navigate to the project folder. Select the file `database/mkff.sql`.

**Step 7:** Click **Go** at the bottom of the page. Wait for the import to complete.

**Step 8:** Verify the import — the left panel should now show all database tables including `users`, `units`, `unit_history`, `daily_reports`, `announcements`, `inventory`, and `target_times`.

*[Insert screenshot of phpMyAdmin showing the mkff database with all tables]*

#### 3.2.3 Configure the Backend

**Step 1:** Copy the entire `mkffwebsystem` project folder into `C:\xampp\htdocs\`. The final path must be: `C:\xampp\htdocs\mkffwebsystem\`

**Step 2:** Open the file `C:\xampp\htdocs\mkffwebsystem\backend\db.php` in any text editor (e.g., Notepad, VS Code).

**Step 3:** Verify the following database connection settings match your XAMPP setup:
- Host: `localhost`
- Username: `root`
- Password: *(leave blank — XAMPP default has no password)*
- Database: `mkff`

**Step 4:** Save the file. The backend is now configured and ready.

*[Insert screenshot of the db.php file showing the connection settings]*

#### 3.2.4 Install Node.js and Frontend Dependencies

**Step 1:** Download Node.js from https://nodejs.org. Select the **LTS** version and run the installer. Follow the default installation steps.

**Step 2:** Open **Command Prompt** (search "cmd" in the Start Menu).

**Step 3:** Navigate to the frontend folder by typing the following command and pressing Enter:
```
cd C:\xampp\htdocs\mkffwebsystem\frontend
```

**Step 4:** Run the following command to install all required packages:
```
npm install
```

**Step 5:** Wait for the installation to complete. A success message will appear when all packages are installed.

*[Insert screenshot of Command Prompt showing npm install running]*

#### 3.2.5 Run the System

**Step 1:** Make sure XAMPP is open and both **Apache** and **MySQL** are running.

**Step 2:** Open **Command Prompt** and navigate to the frontend folder:
```
cd C:\xampp\htdocs\mkffwebsystem\frontend
```

**Step 3:** Start the system by running:
```
npm start
```

**Step 4:** The browser will automatically open and go to `http://localhost:3000`. The MKFF Login page will appear.

**Step 5:** Log in using the Administrator credentials. The system is now ready to use.

*[Insert screenshot of the Login page after the system successfully starts]*

---

## 4.0 Using the System

### 4.1 Login

**Step 1:** Open any web browser (Google Chrome recommended).

**Step 2:** Type the system URL on the browser's address bar: `http://localhost:3000`

The Login page will appear.

**Step 3:** Enter your **Username** and **Password** in the provided fields.

**Step 4:** Click the **Login** button.

The system will automatically redirect you to your role's home page:
- Administrator → Dashboard (`/admin/dashboard`)
- IT Assistant → Overview (`/itassistant/overview`)
- Operator → Station Home (`/operator/home`)

If the credentials are incorrect, an error message will appear below the login form.

*[Insert screenshot of the Login page with labeled username, password fields, and login button]*

---

### 4.2 Administrator's Module

#### 4.2.1 Login

**Step 1:** Open any web browser and go to `http://localhost:3000`. The Login page will appear.

**Step 2:** Enter the Administrator credentials in the login form.

**Login Credentials for Administrator:**
- Username: admin1 *(replace with your actual username)*
- Password: *(replace with your actual password)*

**Step 3:** Click the **Login** button. The system will redirect to the Administrator Dashboard at `/admin/dashboard`.

*[Insert screenshot of the Admin Dashboard immediately after login]*

#### 4.2.2 Dashboard

The Dashboard is the Administrator's main screen. It provides a complete real-time overview of the entire production line. All data refreshes automatically every 1 second without needing to reload the page.

*[Insert full-page screenshot of the Dashboard with numbered callouts]*

##### 4.2.2.1 Summary Cards

At the top of the Dashboard are six summary cards showing real-time production counts and percentages:

- **Total Units** — total number of all units currently in the system
- **Completed** — units that have successfully passed all production stations
- **In Progress** — units currently being processed at any station
- **No Good (NG)** — units identified as defective
- **Pending Approval** — units flagged by operators and waiting for Administrator or IT Assistant review
- **For Scanning** — units that have been generated via QR code but have not yet been scanned at any station

Each card displays both the count and its percentage of the total.

*[Insert zoomed-in screenshot of the six summary cards]*

##### 4.2.2.2 Line Health Status

The Line Health Status badge shows the overall condition of the production line in real time. It is located near the top of the dashboard and updates automatically based on the current FPY and delay data:

- **STABLE** (green) — FPY is above 95% and no stations have critical delays
- **AT RISK** (yellow) — one station has delays exceeding 50% over the allowed threshold
- **BOTTLENECKED** (red) — multiple stations have critical delays at 100% or more over the threshold
- **MONITORING** (blue) — system is running normally with no active alerts

*[Insert screenshot showing the Line Health Status badge]*

##### 4.2.2.3 Throughput Trend Chart

The Throughput Trend is a line chart that displays how many units were completed per hour over the last 12 hours. It helps the Administrator identify peak production periods, slowdowns, and trends across shifts. The chart also shows a percentage change compared to the previous 12-hour window.

*[Insert screenshot of the Throughput Trend line chart]*

##### 4.2.2.4 First Pass Yield (FPY)

The First Pass Yield (FPY) metric shows the percentage of units that completed production on the first attempt without being marked as No Good. It is calculated as:

**FPY = (Completed Units ÷ (Completed + No Good Units)) × 100**

A higher FPY percentage indicates better production quality. The target is to maintain FPY above 95%.

*[Insert screenshot of the FPY metric display]*

##### 4.2.2.5 Generate Shift Report

The Administrator can export the entire dashboard as a PDF report for documentation or handover purposes.

**Step 1:** On the Dashboard, click the **Generate Shift Report** button.

**Step 2:** Wait a few seconds while the system captures the dashboard content.

**Step 3:** The PDF file will automatically download to your computer with the filename: `shift-report-[date].pdf`

The exported PDF includes all summary metrics, Line Health Status, FPY, Throughput Trend Chart, and the worst station information.

*[Insert screenshot of the Generate Shift Report button and a sample of the exported PDF]*

##### 4.2.2.6 AI Critical Station Diagnosis

The AI Critical Station Diagnosis section on the Dashboard automatically identifies the worst-performing station on the production line and generates an AI-powered 3-part analysis.

**Step 1:** On the Dashboard, locate the AI Diagnosis section.

**Step 2:** Click the **Analyze** or **Run Diagnosis** button to generate the analysis.

**Step 3:** The system evaluates all stations and produces three output cards:
- **Root Cause** — what is causing the current bottleneck or quality issue
- **Impact Forecast** — what will happen if the issue is not addressed
- **Action Items** — specific recommended steps to resolve the problem

*[Insert screenshot of the AI Diagnosis output showing all three cards]*

---

#### 4.2.3 Stations Overview

The Stations Overview page displays all 15 production stations. When this page is opened, an AI Diagnostic panel appears at the top showing an immediate analysis of the current worst-performing station. Below the panel, all station cards are displayed in a grid layout.

*[Insert screenshot of the full Stations Overview page showing the AI Diagnostic panel at the top and the station cards grid below]*

#### 4.2.3.1 AI Station Diagnostic

At the very top of the Stations Overview page, the AI Diagnostic panel automatically identifies the worst-performing station and generates a real-time 3-part analysis. This appears as soon as the page is opened — no need to click into any specific station first.

**Step 1:** Click **Stations Overview** from the left sidebar navigation.

**Step 2:** The AI Diagnostic panel will load automatically at the top of the page, showing analysis of the current worst station.

**Step 3:** To regenerate the analysis with the latest data, click the **Analyze** or **Run Diagnosis** button.

The output appears in three side-by-side cards:

*[Insert full screenshot of the AI Diagnostic panel showing all three cards]*

##### 4.2.3.1.1 Root Cause

The **Root Cause** card (displayed with a red border on the left) identifies what is causing the current bottleneck at the worst station. It analyzes how long units have been stuck, whether units are marked No Good, and which process step is most likely responsible.

Example output: *"Unit ASSY-00012 has been at Station 2 for 45 minutes, exceeding the 8-minute threshold by 462%."*

*[Insert zoomed-in screenshot of the Root Cause card]*

##### 4.2.3.1.2 Impact Forecast

The **Impact Forecast** card (displayed with a yellow border in the center) predicts what will happen to the overall production line if the identified issue is not addressed. It considers the current delay severity, number of affected units, and risk to downstream stations.

Example output: *"If unresolved, downstream stations may experience a unit shortage within 30 minutes."*

*[Insert zoomed-in screenshot of the Impact Forecast card]*

##### 4.2.3.1.3 Action Items (Delay Resolution)

The **Action Items** card (displayed with a green border on the right) provides specific recommended steps to resolve the identified issue, directed at the Administrator or Station Supervisor.

Example output: *"Reassign an additional operator to Station 2 to clear the backlog."*

*[Insert zoomed-in screenshot of the Action Items card]*

##### 4.2.3.2 Station Cards Grid

Below the AI Diagnostic panel, all 15 production stations are displayed as individual cards. Each card shows:

- Station number and process name (e.g., Station 2 — Integrated Board Test)
- Number of units: In Progress, Completed, No Good
- Yield Rate percentage
- Color indicator based on current status: green (normal), yellow (moderate delay), red (critical delay)

**Step 1:** Scroll down past the AI Diagnostic panel to view the station cards grid.

**Step 2:** Click on any station card to open the Station Monitor for that specific station.

*[Insert screenshot of the station cards grid with color indicators visible]*

##### 4.2.3.3 Station Monitor

The Station Monitor is a drill-down view for one specific station showing all units currently assigned to it.

**Step 1:** Click on a station card from the grid to open its Station Monitor.

**Step 2:** The Station Monitor table will display all units at that station with the following columns: Assembly No., Model, Status, Time in Station, and an Edit button.

**Step 3:** Use the **Status Filter** dropdown to show units of a specific status only (e.g., In Progress, No Good).

**Step 4:** Use the **Search** bar to find a specific unit by Assembly No.

Units that have exceeded the delay threshold are highlighted — yellow for MODERATE delays and red for CRITICAL delays.

*[Insert screenshot of the Station Monitor view with a delayed unit highlighted]*

##### 4.2.3.4 Station Checklist

Clicking on a unit row in the Station Monitor opens its Station Checklist — a detailed record of the quality inspection results performed at that station.

**Step 1:** In the Station Monitor, click on any unit row to expand its details.

**Step 2:** The Station Checklist will show all inspection parameters for that station. Values displayed in green indicate the item passed. Values in red indicate a failure.

Checklist fields vary per station. Examples:
- Station 1 (PCB Pairing): Header connector angle, soldering quality
- Station 2 (Integrated Board Test): LoRa module, voltage readings (L1, L2, L3), LED status, Go/No-Go
- Station 6 (Complete Unit Test): Full calibration results including energy meter and connectivity

*[Insert screenshot of a unit's Station Checklist with green and red value indicators]*

##### 4.2.4.1 Filter Reports by Date and Station

**Step 1:** Click **Reports** from the left sidebar navigation.

**Step 2:** Use the **Date** picker to select the report date you want to view.

**Step 3:** Use the **Station** dropdown to filter by a specific station or select "All" to see reports from all stations.

**Step 4:** The reports table updates automatically based on the selected filters. Each row shows: Station, Report Date, and Submitted By.

*[Insert screenshot of the Reports page with filters and results table visible]*

##### 4.2.4.2 View Report Details

**Step 1:** In the Reports list, click the **View** button on any report row.

**Step 2:** The Report Detail Modal will open showing the full report content including: station name, report date, operator name, shift notes, issues encountered, and any attached images or files.

**Step 3:** Click on an attached image thumbnail to view it in full size, or click a file attachment to download it.

**Step 4:** Click **Close** to dismiss the modal and return to the reports list.

*[Insert screenshot of the Report Detail Modal with all fields labeled]*

---

#### 4.2.5 Approval Queue

##### 4.2.5.1 View Pending Units

**Step 1:** Click **Approval Queue** from the left sidebar navigation.

The page will display all units currently with status "Pending Approval". Each row shows: Assembly No., Model, current Station, and an Approve button.

*[Insert screenshot of the Approval Queue page]*

##### 4.2.5.2 Approve a Unit

**Step 1:** In the Approval Queue, click the **Approve** button on the unit you want to approve.

**Step 2:** A confirmation modal will appear showing the unit's details.

**Step 3:** Click **Confirm** to proceed with the approval.

**Step 4:** The unit status will change to "In Progress" and the unit will be returned to its assigned station. A success message will appear at the top of the screen.

*[Insert screenshot of the approval confirmation modal]*

---

#### 4.2.6 No Good Units

##### 4.2.6.1 View NG Units

**Step 1:** Click **No Good Units** from the left sidebar navigation.

The page displays all units across all 15 stations with status "No Good (NG)". Each row shows: Assembly No., Model, Station, Remarks, and the timestamp when the unit was last updated.

*[Insert screenshot of the No Good Units list with all columns labeled]*

##### 4.2.6.2 Edit NG Unit

**Step 1:** In the No Good Units list, click the **Edit** button on any unit row.

**Step 2:** The Edit Unit Modal opens showing the unit's current details.

**Step 3:** Update the **Status** if the defect is resolved (e.g., back to "In Progress"), or update the **Remarks** field with notes about the defect.

**Step 4:** Click **Save**. The unit is updated and the list refreshes automatically.

*[Insert screenshot of the Edit Unit Modal with fields labeled]*

---

#### 4.2.7 Shipment

##### 4.2.7.1 View Units Ready for Dispatch

**Step 1:** Click **Shipment** from the left sidebar navigation.

The page lists all units at Station 15 (QC Stamping) with status "Completed" — these have passed all 15 production stations and are cleared for shipment. Each row shows: Assembly No., Model, Revision, and a Dispatch button.

*[Insert screenshot of the Shipment list]*

##### 4.2.7.2 Dispatch a Unit

**Step 1:** In the Shipment list, click the **Dispatch** button on the unit to release.

**Step 2:** A PIN entry prompt appears.

**Step 3:** Enter the **Release PIN** (configured in Settings).

**Step 4:** Click **Confirm**. The unit status changes to "Dispatched" and is removed from the list. A success message appears.

*[Insert screenshot of the PIN entry prompt]*

---

#### 4.2.8 Inventory

##### 4.2.8.1 View Inventory

**Step 1:** Click **Inventory** from the left sidebar navigation.

All production units in the system are listed here, grouped by batch. Each batch corresponds to QR codes generated at the same time. Columns: Assembly No., Model, Revision, Current Status, Current Station.

*[Insert screenshot of the Inventory list with grouped batches]*

##### 4.2.8.2 Search Inventory

**Step 1:** In the Inventory page, type in the **Search** bar at the top.

**Step 2:** Enter the Assembly No. or Model name. The list filters in real time. Pagination shows 10 items per page — use the page navigation at the bottom to browse all results.

*[Insert screenshot of the search bar with filtered results]*

---

#### 4.2.9 Announcements

##### 4.2.9.1 Post an Announcement

**Step 1:** Click **Announcements** from the left sidebar navigation.

**Step 2:** Click the **Post Announcement** button at the top of the page.

**Step 3:** The Announcement Modal opens. Type your message in the text area.

**Step 4:** Click **Post**. The announcement is immediately visible to all users — Administrator, IT Assistant, and Operator.

*[Insert screenshot of the Announcements page and the compose modal]*

##### 4.2.9.2 Delete an Announcement

**Step 1:** In the Announcements list, find the announcement to remove.

**Step 2:** Click the **Delete** (trash) icon next to it.

**Step 3:** A confirmation modal appears.

**Step 4:** Click **Confirm Delete**. The announcement is permanently removed.

*[Insert screenshot of the delete confirmation modal]*

---

#### 4.2.10 User Management

##### 4.2.10.1 View Users

**Step 1:** Click **User Management** from the left sidebar navigation.

A table lists all registered system users showing: ID, Avatar, Full Name, Username, Role, and Assigned Station.

*[Insert screenshot of the User Management table with all columns]*

##### 4.2.10.2 Add a User

**Step 1:** Click the **Add User** button at the top of the page.

**Step 2:** The Manage User Modal opens. Fill in the following:
- **Full Name** — the user's complete name
- **Username** — the login username
- **Password** — the login password
- **Role** — Administrator, IT Assistant, or Operator
- **Assigned Station** — for Operators, select their station (e.g., Station 1)
- **Avatar** — optionally upload a profile photo

**Step 3:** Click **Save**. The new account is created and appears in the user list.

*[Insert screenshot of the Add User modal with fields labeled]*

##### 4.2.10.3 Edit a User

**Step 1:** Click the **Edit** (pencil) icon on the user row you want to update.

**Step 2:** The Manage User Modal opens pre-filled with the user's current data.

**Step 3:** Update any field as needed (name, password, role, station, or avatar).

**Step 4:** Click **Save**. Changes are applied immediately.

*[Insert screenshot of the Edit User modal]*

##### 4.2.10.4 Delete a User

**Step 1:** Click the **Delete** (trash) icon on the user row you want to remove.

**Step 2:** The Delete User confirmation modal appears showing the user's name.

**Step 3:** Click **Confirm Delete**. The user account is permanently removed.

*[Insert screenshot of the delete confirmation modal]*

---

#### 4.2.11 Notifications

##### 4.2.11.1 Unit Delay Alert

A ⚠️ **Unit Delay Alert** is triggered automatically when a unit with status "In Progress" has been at a station longer than the configured threshold for that station. The bell icon in the top-right shows a red badge with the count of active alerts.

Each alert displays: station name, Assembly No. of the unit, elapsed time, and the allowed time limit.

**Step 1:** Click the **bell icon** in the top navigation to open the Notifications page.

**Step 2:** Click on a Unit Delay Alert to navigate directly to the Station Monitor. The delayed unit will be highlighted in the unit list.

*[Insert screenshot of the bell icon with red badge and the Unit Delay Alert notification card]*

##### 4.2.11.2 Quality Alert (No Good)

A 🚨 **Quality Alert** is triggered when a unit with status "No Good (NG)" has been at a station beyond the allowed threshold. These are higher priority than delay alerts.

**Step 1:** Click the **bell icon** to view Quality Alerts on the Notifications page.

**Step 2:** Click on a Quality Alert to navigate to the Station Monitor. The NG unit will be highlighted.

*[Insert screenshot of a Quality Alert notification card]*

##### 4.2.11.3 Dismiss Notifications

**Step 1:** Click **Notifications** from the sidebar or click the bell icon.

**Step 2:** Click the **Dismiss All** button to clear all active alerts at once.

Individual alerts also disappear automatically once the unit is resolved, moved, or its status is updated.

*[Insert screenshot of the Notifications page with the Dismiss All button visible]*

---

#### 4.2.12 Settings

##### 4.2.12.1 Configure Station Thresholds

**Step 1:** Click **Settings** from the left sidebar navigation.

**Step 2:** Click the **Configure Thresholds** button in the Station Thresholds card.

**Step 3:** The Target Time Management modal opens listing all 15 stations with their current threshold values in minutes.

**Step 4:** Click on the threshold field for any station and type the new value in minutes.

**Step 5:** Click **Save**. Changes take effect immediately for all users — delay alerts will use the new thresholds right away.

*[Insert screenshot of the Configure Thresholds modal showing all 15 stations with editable fields]*

##### 4.2.12.2 View Release PIN

**Step 1:** In the Settings page, click the **View PIN** button in the Release PIN card.

**Step 2:** A security verification modal appears asking for your Admin Password.

**Step 3:** Enter your Administrator password and click **Verify**.

**Step 4:** The current Release PIN is displayed in large text on screen.

**Step 5:** Click **Close** when done. This PIN is required to authorize shipment dispatches — keep it confidential.

*[Insert screenshot of the PIN reveal screen after password verification]*

##### 4.2.12.3 Reset Release PIN

**Step 1:** In the Settings page, click the **Reset PIN** button in the Release PIN card.

**Step 2:** The Reset PIN modal opens with three input fields.

**Step 3:** Enter the **Current PIN**, then the **New PIN**, then **Confirm New PIN**. The new PIN must be at least 4 characters.

**Step 4:** Click **Update PIN**. A success message confirms the change.

*[Insert screenshot of the Reset PIN modal with all three fields labeled]*

---

### 4.3 IT Assistant's Module

#### 4.3.1 Login

**Step 1:** Open a browser and go to `http://localhost:3000`.

**Step 2:** Enter the IT Assistant credentials and click **Login**.

**Login Credentials for IT Assistant:**
- Username: itassist1 *(replace with your actual IT Assistant username)*
- Password: *(replace with your actual IT Assistant password)*

**Step 3:** The system redirects to the IT Assistant Overview at `/itassistant/overview`.

*[Insert screenshot of the IT Assistant Overview page right after login]*

---

#### 4.3.2 Overview Dashboard

The IT Assistant Overview Dashboard shows a complete real-time production summary. It includes:

- Six summary cards: Total Scanned, For Scanning, In Progress, Completed, No Good, Pending Approval
- Throughput Trend Line Chart — completed units per hour over the last 12 hours
- First Pass Yield (FPY) — overall quality rate
- Process Stepper — scrollable horizontal view of all 15 stations
- Unit Search / QR Scan input — find any unit by Assembly No.

*[Insert screenshot of the IT Assistant Overview Dashboard with labeled sections]*

---

#### 4.3.3 QR Code Generator

##### 4.3.3.1 Generate QR Codes

**Step 1:** Click **QR Generator** from the left sidebar navigation.

**Step 2:** Fill in the QR generation form:
- **Model** — product model name (e.g., MKFF-X1)
- **Revision** — revision code (e.g., REV-01)
- **Base Unit Kitting No.** — base kit reference number
- **Accessory Kitting No.** — accessory kit reference number
- **Quantity** — number of QR codes to generate (1 to 100)

**Step 3:** Click the **Generate QR Codes** button.

**Step 4:** The system generates unique Assembly Numbers (ASSY-XXXXX) and board serial numbers (MNBD, CMBD, LRBD, PQBD, BKBD) for each unit.

**Step 5:** Generated QR codes appear in the list below the form.

*[Insert screenshot of the QR Generator form with all fields labeled]*

##### 4.3.3.2 Print / Save QR Codes

**Step 1:** After generating, scroll down to the Generated QR List.

**Step 2:** Use the download or print button next to each QR code to save or print it.

**Step 3:** Attach the printed QR code labels to the physical production units. Operators will scan these when the units arrive at their station.

*[Insert screenshot of the Generated QR List with download/print buttons visible]*

---

#### 4.3.4 Station Monitor

##### 4.3.4.1 Live Monitoring Table

**Step 1:** Click **Station Monitor** from the left sidebar navigation.

The Live Monitoring Table displays all units currently active across all 15 stations. It auto-refreshes every 1 second.

Columns: Assembly No., Model, Current Station, Status, Time in Station. Delayed units are highlighted in yellow (MODERATE) or red (CRITICAL).

*[Insert screenshot of the Live Monitoring Table with a delayed unit highlighted]*

##### 4.3.4.2 Unscanned Units Table

**Step 1:** On the Station Monitor page, view the **Unscanned Units** section.

This table shows all units generated via QR code that have not yet been scanned at any station. Their status is "For Scanning". This is used to track which units from a batch have entered the production line.

*[Insert screenshot of the Unscanned Units Table]*

---

#### 4.3.5 Approvals

##### 4.3.5.1 View Pending Units

**Step 1:** Click **Approvals** from the left sidebar navigation.

All units with status "Pending Approval" are listed here. Columns: Assembly No., Model, Current Station, Approve button.

*[Insert screenshot of the IT Assistant Approvals list]*

##### 4.3.5.2 Approve a Unit

**Step 1:** Click the **Approve** button on the unit row.

**Step 2:** The Approval Confirmation Modal opens showing the unit's details.

**Step 3:** Click **Confirm**. The unit status changes to "In Progress" and is returned to its assigned station.

*[Insert screenshot of the Approval Confirmation Modal]*

---

#### 4.3.6 Reports

##### 4.3.6.1 Filter Reports

**Step 1:** Click **Reports** from the left sidebar navigation.

**Step 2:** Use the **Date** picker to select the date of reports to view.

**Step 3:** Use the **Station** dropdown to filter by station or select "All".

*[Insert screenshot of the Reports filter controls and results table]*

##### 4.3.6.2 View Report Details

**Step 1:** Click the **View** button on any report row.

**Step 2:** The Report Detail Modal opens showing: station, date, operator name, shift notes, issues encountered, and any file or image attachments.

**Step 3:** Click **Close** to return to the reports list.

*[Insert screenshot of the Report Detail Modal]*

---

#### 4.3.7 Announcements

**Step 1:** Click **Announcements** from the left sidebar navigation.

The IT Assistant can read announcements posted by the Administrator. This is a read-only view. New announcements posted today are visually highlighted. The sidebar shows today's announcement count as a badge.

*[Insert screenshot of the IT Assistant Announcements view]*

---

#### 4.3.8 Notifications

**Step 1:** Click the **bell icon** in the top navigation to view active alerts.

The IT Assistant receives real-time delay alerts and quality alerts, same as the Administrator. Each notification shows: affected station, Assembly No., elapsed time, and the limit.

**Step 2:** Click on any notification to navigate to the Station Details view for that station. The delayed or NG unit will be highlighted in the list.

*[Insert screenshot of the IT Assistant notification list]*

---

### 4.4 Operator's Module

#### 4.4.1 Login

**Step 1:** Open a browser and go to `http://localhost:3000`.

**Step 2:** Enter the Operator credentials and click **Login**.

**Login Credentials for Operator:**
- Username: operator1 *(replace with your actual Operator username)*
- Password: *(replace with your actual Operator password)*

**Step 3:** The system redirects to the Operator Station Home at `/operator/home`. The page automatically loads data for the Operator's assigned station.

*[Insert screenshot of the Operator Home page right after login]*

---

#### 4.4.2 Home Dashboard

The Operator Home Dashboard shows a real-time summary of their assigned station:

- Station name and process description (e.g., Station 2 — Integrated Board Test)
- Count cards: Completed, In Progress, No Good units at this station
- Yield Rate percentage for this station
- Station Doughnut Chart — visual breakdown of unit statuses
- Quick navigation buttons to Unit Entry, Unit List, and History Log

*[Insert screenshot of the Operator Home Dashboard with all sections labeled]*

---

#### 4.4.3 Unit Entry

##### 4.4.3.1 Scan QR Code

**Step 1:** From the sidebar or Home Dashboard, go to the **Unit Entry** section.

**Step 2:** Use a USB or Bluetooth QR scanner to scan the QR code on the physical unit. Alternatively, manually type the Assembly No. in the search field and press Enter.

**Step 3:** The system finds the unit and displays its current details: Assembly No., Model, Revision, current Status, and Station.

**Step 4:** Verify the information matches the physical unit before proceeding.

*[Insert screenshot of the QR scan input and the matched unit card display]*

##### 4.4.3.2 Update Unit Status

**Step 1:** After scanning and verifying the unit, select the new status from the **Status** dropdown:
- **In Progress** — the unit is now being processed at this station
- **Completed** — the unit has passed this station and is ready to move forward
- **No Good (NG)** — the unit has a defect; a remark is required
- **Pending Approval** — the unit needs review by an Administrator or IT Assistant

**Step 2:** Add **Remarks** in the remarks field if applicable. Required for No Good status.

**Step 3:** Click **Update** or **Save**. The unit status is updated in real time and visible to all connected users.

*[Insert screenshot of the status update dropdown and remarks field]*

---

#### 4.4.4 Unit List Table

##### 4.4.4.1 View Current Units

**Step 1:** Click **Unit List** from the left sidebar navigation.

The table shows all units currently at the Operator's assigned station. Columns: Assembly No., Model, Status badge, Time in Station, Edit button.

Units that have been at the station longer than the allowed threshold are highlighted — yellow for moderate and red for critical.

*[Insert screenshot of the Unit List Table with all columns labeled and a highlighted delayed unit]*

##### 4.4.4.2 Edit a Unit

**Step 1:** In the Unit List, click the **Edit** button on any unit row.

**Step 2:** The Edit Unit Modal opens showing the unit's current details.

**Step 3:** Update the **Status** and/or **Remarks** as needed.

**Step 4:** Click **Save**. The unit is updated immediately.

*[Insert screenshot of the Edit Unit Modal with fields labeled]*

---

#### 4.4.5 Unit History Log

**Step 1:** Click **History Log** from the left sidebar navigation.

The History Log shows a complete record of all units ever processed at this station, including every status change. Columns: Assembly No., Model, Previous Status, New Status, Changed By (operator name), Timestamp.

This page is useful for shift handovers, quality audits, and traceability.

*[Insert screenshot of the Unit History Log table]*

---

#### 4.4.6 Daily Report

##### 4.4.6.1 Submit Daily Report

At the end of each production shift, the Operator submits a daily report.

**Step 1:** Click **Daily Report** from the left sidebar navigation.

**Step 2:** Click the **Submit Daily Report** button.

**Step 3:** The Submit Report Modal opens. Fill in the following:
- **Shift Summary** — describe what was accomplished during the shift
- **Issues Encountered** — note any problems, delays, or quality concerns
- **Attachment** — optionally attach a photo or file (image or PDF)

**Step 4:** Click **Submit**. The report is saved and immediately visible to Administrators and IT Assistants in their Reports section.

*[Insert screenshot of the Submit Report Modal with all fields labeled]*

---

#### 4.4.7 Announcements

**Step 1:** Click **Announcements** from the left sidebar navigation.

Operators can read announcements posted by the Administrator. This is a read-only view. New announcements posted today are highlighted in the list. The sidebar badge shows how many new announcements were posted today.

*[Insert screenshot of the Operator Announcements view with a highlighted new announcement]*

---

#### 4.4.8 Notifications

**Step 1:** Click the **bell icon** in the top navigation to view active alerts.

Operators receive real-time delay alerts for units at their assigned station that have exceeded the allowed threshold. Each notification shows: station name, Assembly No., elapsed time, and allowed limit.

**Step 2:** Click on any notification. The Unit List Table opens and the specific delayed unit is highlighted automatically.

**Step 3:** Resolve the alert by updating the unit's status (e.g., mark as Completed or No Good).

*[Insert screenshot of the Operator notification bell and the notification list]*

---

*End of User Manual*

---

