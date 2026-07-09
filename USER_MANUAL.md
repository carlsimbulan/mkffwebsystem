# MKFF Web Monitoring System
## User Manual

---

**System Name:** MKFF Web Monitoring System  
**Version:** 1.0  
**Prepared by:** [Your Group Name]  
**Date:** July 2026  
**Instructor:** [Your Professor's Name]  
**Course:** [Your Course Name]  

---

## TABLE OF CONTENTS

1.0 [Introduction](#10-introduction)
2.0 [Getting Started](#20-getting-started)
3.0 [Administrator Module](#30-administrator-module)
4.0 [Operator Module](#40-operator-module)
5.0 [IT Assistant Module](#50-it-assistant-module)
6.0 [Notifications System](#60-notifications-system)
7.0 [Troubleshooting](#70-troubleshooting)
8.0 [System Administration Reference](#80-system-administration-reference)

---

## 1.0 INTRODUCTION

### 1.1 Purpose of the System

> **[WHAT TO WRITE HERE]**
> Write 2–3 sentences explaining what the system is for. Example:
> "The MKFF Web Monitoring System is a web-based production monitoring application designed to
> track the manufacturing progress of units across 15 production stations. It provides real-time
> visibility to Administrators, Operators, and IT Assistants to ensure quality and efficiency in the
> production line."

### 1.2 System Overview

> **[WHAT TO WRITE HERE]**
> Describe the system at a high level. Mention:
> - It is a web app built with React (frontend) and PHP (backend)
> - It connects to a MySQL database via XAMPP/Apache
> - It supports 3 user roles: Administrator, Operator, IT Assistant
> - It monitors 15 production stations (PCB Pairing → QC Stamping)
> - It features real-time data polling every 1 second
> Include a system architecture diagram here if required by your professor.

### 1.3 User Roles

> **[WHAT TO WRITE HERE]**
> Create a table like this:

| Role | Description |
|------|-------------|
| Administrator | Full access to all modules. Manages users, approves units, views reports, and configures system settings. |
| Operator | Assigned to a specific station. Scans/enters units, updates unit status, and submits daily reports. |
| IT Assistant | Generates QR codes for new units, monitors production line, and approves units flagged for review. |

### 1.4 System Requirements

> **[WHAT TO WRITE HERE]**
> List what is needed to run the system:
> - XAMPP (Apache + MySQL) running on localhost
> - A modern web browser (Chrome, Edge, Firefox)
> - Node.js installed for running the React frontend
> - Local network access if used on multiple machines

### 1.5 Accessing the System

> **[WHAT TO WRITE HERE]**
> Write the steps to open the system:
> 1. Start XAMPP and make sure Apache and MySQL are running.
> 2. Open your browser and go to `http://localhost:3000` (or your configured port).
> 3. The Login page will appear automatically.

---

## 2.0 GETTING STARTED

### 2.1 Logging In

> **[WHAT TO WRITE HERE]**
> Explain the login process step by step:
> 1. Open the system URL in a browser.
> 2. Enter your **Username** and **Password** in the login form.
> 3. Click the **Login** button.
> 4. The system will redirect you to your role's home page automatically.
>    - Administrator → `/admin/dashboard`
>    - IT Assistant → `/itassistant/overview`
>    - Operator → `/operator/home`
>
> Include a **screenshot of the Login page** here.
> Label the username field, password field, and login button in the screenshot.

### 2.2 Role-Based Navigation Overview

> **[WHAT TO WRITE HERE]**
> After logging in, each user sees a different layout:
> - **Administrator** — sees a full sidebar with Dashboard, Stations, Reports, Approvals, Inventory, Shipment, No Good Units, Announcements, User Management, Notifications, and Settings.
> - **Operator** — sees a station-focused layout with Home, Unit Entry, Unit List, History Log, Daily Report, and Announcements.
> - **IT Assistant** — sees Overview, QR Generator, Station Monitor, Approvals, Inventory, Reports, and Announcements.
>
> Include **annotated screenshots** of each role's navigation sidebar/menu.

### 2.3 Logging Out

> **[WHAT TO WRITE HERE]**
> Explain how to log out:
> 1. Click your **profile/avatar** icon on the top-right of the screen.
> 2. A dropdown menu will appear.
> 3. Click **Logout**.
> 4. You will be redirected back to the Login page.
> 5. Your session is cleared from the browser.
>
> Include a screenshot showing the logout dropdown.

---

## 3.0 ADMINISTRATOR MODULE

> **[INTRO SENTENCE FOR THIS CHAPTER]**
> Write: "The Administrator has full access to all features of the system. This chapter covers each
> section of the Admin dashboard."

### 3.1 Dashboard

> **[WHAT TO WRITE HERE]**
> Describe the Dashboard page. It shows a real-time production overview. Cover:
> - **Summary Cards** at the top: Total Units, Completed, In Progress, No Good (NG), Pending Approval, For Scanning — with percentage breakdowns.
> - **Line Health Status** badge: shows STABLE / AT RISK / BOTTLENECKED / MONITORING based on FPY and delays.
> - **Throughput Trend Chart** (Line Chart): shows completed units per hour for the last 12 hours.
> - **Avg Cycle Time per Station** (Bar Chart): shows average time units spend at each station vs. the threshold.
> - **First Pass Yield (FPY)**: shows percentage of units completed without defects.
> - **Process Stepper**: horizontal scrollable view of all 15 stations showing current activity.
> - **Unit Search / QR Scan input**: allows searching for a unit by Assembly No. or scanning a QR code.
> - **Generate Shift Report button**: exports the dashboard as a PDF.
> - **AI Critical Station Diagnosis**: AI-powered analysis (Root Cause / Impact Forecast / Action Items) for the worst-performing station.
>
> Include **annotated screenshots** of the dashboard. Label each card and chart.

### 3.2 Stations Overview

> **[WHAT TO WRITE HERE]**
> Describe the Stations Overview page. It shows all 15 stations in a grid. Cover:
> - Each station card shows: station name, units In Progress, Completed, No Good, and Yield Rate.
> - Clicking a station opens the **Station Monitor** view for that specific station.
> - Status color coding: green = good, yellow = at risk, red = delayed/critical.
> - Station units can be filtered by status (All, In Progress, Completed, No Good, Pending Approval, For Scanning).
>
> #### 3.2.1 Station Monitor (Per-Station Drill Down)
> - Shows all units currently at the selected station.
> - Each unit row shows: Assembly No., Status badge, Time in Station, and an Edit button.
> - Delayed units are highlighted in red/yellow based on severity (MODERATE or CRITICAL).
> - Clicking a unit shows its **Station Checklist** — a detailed view of quality check results for that station (e.g., voltage readings, LED status, Go/No-Go results).
> - Includes **AI Station Analysis** button: generates Diagnosis / Forecast / Prescription for that specific station.
>
> Include **screenshots** of the station grid and the station monitor drill-down view.

### 3.3 Reports

> **[WHAT TO WRITE HERE]**
> Describe the Reports page. Cover:
> - Use the **Date filter** to select which day's reports to view.
> - Use the **Station filter** dropdown to show reports from a specific station or all stations.
> - Reports are listed in a table: Station, Report Date, Submitted By, and a View button.
> - Clicking **View** opens the **Report Detail Modal** showing full report contents including photos/attachments.
>
> Include a screenshot of the Reports list and the Report Detail Modal.

### 3.4 Approval Queue

> **[WHAT TO WRITE HERE]**
> Describe the Approval Queue page. Cover:
> - Units with status **"Pending Approval"** appear here. These are units that operators have flagged for admin review.
> - Each row shows: Assembly No., Model, Station, and an Approve button.
> - Clicking **Approve** opens a confirmation modal.
> - Confirming approval changes the unit status to **"In Progress"** and returns it to the production line.
>
> Include a screenshot of the Approval Queue and the Approve confirmation modal.

### 3.5 No Good Units

> **[WHAT TO WRITE HERE]**
> Describe the No Good Units page. Cover:
> - Lists all units with status **"No Good (NG)"** across all stations.
> - Shows: Assembly No., Model, Station, Remarks, and timestamp.
> - Admins can click Edit to update the unit's status or add remarks.
>
> Include a screenshot of the No Good Units list.

### 3.6 Shipment

> **[WHAT TO WRITE HERE]**
> Describe the Shipment page. Cover:
> - Lists units at **Station 15 (QC Stamping)** with status **"Completed"** — these are ready to ship.
> - Each row shows: Assembly No., Model, Revision, and a **Dispatch** button.
> - Clicking **Dispatch** requires entering a **Release PIN** for authorization.
> - Once dispatched, the unit status changes to **"Dispatched"** and it is cleared from Station 15.
>
> Include a screenshot of the Shipment list and the PIN entry prompt.

### 3.7 Inventory

> **[WHAT TO WRITE HERE]**
> Describe the Inventory page. Cover:
> - Displays all units currently tracked in the system grouped by batch (creation timestamp).
> - Shows: Assembly No., Model, Revision, Status, and Station.
> - Use the search bar to filter units by Assembly No. or Model name.
> - Pagination is available (10 items per page).
>
> Include a screenshot of the Inventory list.

### 3.8 Announcements

> **[WHAT TO WRITE HERE]**
> Describe the Announcements page. Cover:
> - Administrators can post messages visible to all users.
> - Click **Post Announcement** to open the announcement compose modal. Type the message and submit.
> - Each announcement shows: content, posted by, and date/time.
> - Administrators can delete any announcement by clicking the **Delete** icon and confirming in the modal.
>
> Include screenshots of the announcements list, post modal, and delete confirmation.

### 3.9 User Management

> **[WHAT TO WRITE HERE]**
> Describe the User Management page. Cover:
> - Lists all system users: ID, Full Name, Username, Role, and Assigned Station.
> - **Add User**: Click the Add User button. Fill in Full Name, Username, Password, Role, and Station. Upload an avatar (optional). Click Save.
> - **Edit User**: Click the Edit icon on a user row. Update any field. Click Save.
> - **View User**: Click the View icon to see full user details including hidden password (toggle to reveal).
> - **Delete User**: Click the Delete icon. Confirm in the delete confirmation modal.
>
> Include screenshots of the user list, add/edit modal, and delete modal.

### 3.10 Notifications

> **[WHAT TO WRITE HERE]**
> Describe the Notifications page. Cover:
> - The **bell icon** in the top navigation shows the count of active alerts.
> - Clicking the bell opens the Notifications page.
> - Two types of notifications:
>   - **⚠️ Unit Delay Alert**: A unit has been in a station longer than the allowed threshold.
>   - **🚨 Quality Alert (NG)**: A unit with No Good status has exceeded the threshold.
> - Each notification shows: station name, unit assembly number, elapsed time, and limit.
> - Clicking a notification navigates directly to the Station Monitor for that unit and highlights the unit in the list.
> - Use **Dismiss All** to clear all notifications.
>
> Include a screenshot of the bell icon with badge count and the Notifications page.

### 3.11 Settings

> **[WHAT TO WRITE HERE]**
> Describe the Settings page. It has two cards:
>
> #### 3.11.1 Station Thresholds
> - Click **Configure Thresholds** to open the Target Time Management modal.
> - Each of the 15 stations has an editable threshold in minutes.
> - These thresholds control when delay notifications are triggered.
> - Click Save to apply. Changes take effect immediately across all users.
>
> #### 3.11.2 Release PIN Management
> - **View PIN**: Click the View PIN button. Enter your admin password to verify. The current PIN is displayed.
> - **Reset PIN**: Click the Reset PIN button. Enter the current PIN, new PIN, and confirm new PIN. Click Update PIN.
> - The Release PIN is required when dispatching units from the Shipment page.
>
> Include screenshots of both settings cards and their respective modals.

---

## 4.0 OPERATOR MODULE

> **[INTRO SENTENCE FOR THIS CHAPTER]**
> Write: "Operators are assigned to a specific production station. This module covers the tools
> available to them for managing units and submitting daily reports."

### 4.1 Home Dashboard

> **[WHAT TO WRITE HERE]**
> Describe the Operator's home screen. Cover:
> - Shows a **summary of the operator's assigned station**: Completed, In Progress, No Good units, and Yield Rate.
> - **Station Doughnut Chart**: visual breakdown of unit statuses for the station.
> - Quick navigation buttons to Unit Entry, Unit List, and History.
>
> Include a screenshot of the Operator home dashboard with labels.

### 4.2 Unit Entry (QR Scan / Manual Entry)

> **[WHAT TO WRITE HERE]**
> Describe how operators receive and begin processing a unit:
> - Operators scan the unit's QR code using a scanner, or manually type the Assembly No.
> - The system finds the unit and displays its details.
> - The operator updates the unit status (e.g., In Progress → Completed or No Good).
> - If marked **No Good**, the operator enters a remark explaining the defect.
> - If the unit needs admin review, the operator can set status to **Pending Approval**.
>
> Include screenshots of the QR scan input and the status update form.

### 4.3 Unit List Table

> **[WHAT TO WRITE HERE]**
> Describe the Unit List for the operator's station:
> - Shows all units currently assigned to this station.
> - Columns: Assembly No., Model, Status badge, Time in Station, and an Edit button.
> - Delayed units are highlighted with a warning color.
> - Click **Edit** to open the Edit Unit Modal and update status or remarks.
>
> Include a screenshot of the Unit List Table with labels on each column.

### 4.4 Unit History Log

> **[WHAT TO WRITE HERE]**
> Describe the History Log:
> - Shows a complete history of all units that have ever passed through this station.
> - Columns: Assembly No., Model, Previous Status, New Status, Changed By, and Timestamp.
> - Useful for traceability and audit purposes.
>
> Include a screenshot of the history log table.

### 4.5 Daily Report Form

> **[WHAT TO WRITE HERE]**
> Describe how operators submit daily reports:
> 1. Click **Submit Daily Report** button.
> 2. The Submit Report Modal opens.
> 3. Fill in the shift summary, issues encountered, and attach an image/file if needed.
> 4. Click **Submit**.
> 5. The report is saved and becomes visible to Administrators in the Reports section.
>
> Include a screenshot of the Submit Report Modal with all fields labeled.

### 4.6 Announcements View

> **[WHAT TO WRITE HERE]**
> Describe the Announcements section for Operators:
> - Operators can read announcements posted by the Administrator.
> - Announcements are listed with content, posted by, and date.
> - New announcements are highlighted or marked as unread.
>
> Include a screenshot of the Operator announcements view.

### 4.7 Notifications

> **[WHAT TO WRITE HERE]**
> Describe the notification bell for Operators:
> - Operators receive real-time delay alerts for units at their station that have exceeded the threshold.
> - Clicking a notification highlights the specific unit in their Unit List Table.
> - Same bell icon and notification format as the Admin module.
>
> Include a screenshot of the notification bell and notification list.

---

## 5.0 IT ASSISTANT MODULE

> **[INTRO SENTENCE FOR THIS CHAPTER]**
> Write: "The IT Assistant is responsible for generating QR codes for new production batches,
> monitoring the overall production line, and approving units that are flagged for review."

### 5.1 Overview Page

> **[WHAT TO WRITE HERE]**
> Describe the IT Assistant Overview (main dashboard):
> - Same summary metrics as the Admin dashboard: Total Units, Completed, In Progress, No Good, Pending Approval, For Scanning.
> - **Throughput Trend Chart** (Line): completed units per hour over the last 12 hours.
> - **First Pass Yield (FPY)** gauge or metric.
> - **Process Stepper**: scrollable view of all 15 stations.
> - **Unit Search / QR Scan input**: search any unit by Assembly No.
>
> Include a screenshot with labels.

### 5.2 QR Code Generation

> **[WHAT TO WRITE HERE]**
> Describe the QR Generator page:
> 1. Fill in the form:
>    - **Model** (e.g., MKFF-X1)
>    - **Revision** (e.g., REV-01)
>    - **Base Unit Kitting No.**
>    - **Accessory Kitting No.**
>    - **Quantity** (1 to 100)
> 2. Click **Generate QR Codes**.
> 3. The system calls the backend to generate unique Assembly Numbers and board serial numbers (MNBD, CMBD, LRBD, PQBD, BKBD).
> 4. QR codes are displayed in the Generated QR List.
> 5. Each QR code encodes: Model | Revision | Base Kit | Assembly No | Board serials | Accessory Kit.
>
> #### 5.2.1 Printing / Saving QR Codes
> - Each QR code can be individually downloaded or printed.
> - The IT Assistant gives these QR codes to operators who attach them to the physical units.
>
> Include screenshots of the QR form and the generated QR list.

### 5.3 Live Monitoring Table

> **[WHAT TO WRITE HERE]**
> Describe the Live Monitoring Table:
> - Shows all units currently In Progress or with active status across all stations.
> - Auto-refreshes every 1 second.
> - Columns: Assembly No., Model, Station, Status, Time in Station.
> - Delayed units are highlighted.
>
> Include a screenshot of the table.

### 5.4 Unscanned Units Table

> **[WHAT TO WRITE HERE]**
> Describe the Unscanned Units Table:
> - Shows units that have been generated (QR created) but have not yet been scanned at any station.
> - Status for these units is **"For Scanning"**.
> - Useful for tracking which batch units have entered the production line.
>
> Include a screenshot.

### 5.5 Approvals

> **[WHAT TO WRITE HERE]**
> Describe the Approvals section for IT Assistants:
> - Similar to the Admin Approval Queue.
> - Lists units with **"Pending Approval"** status.
> - The IT Assistant reviews the unit and clicks **Approve**.
> - Approved units are returned to the production station with status **"In Progress"**.
>
> Include a screenshot of the Approvals list and approval confirmation modal.

### 5.6 Reports

> **[WHAT TO WRITE HERE]**
> Describe the Reports section for IT Assistants:
> - View daily reports submitted by Operators.
> - Filter by date and station.
> - Click **View** on any report to open the Report Detail Modal with full content and attachments.
>
> Include a screenshot.

### 5.7 Announcements

> **[WHAT TO WRITE HERE]**
> Describe the Announcements section for IT Assistants:
> - Read-only view of announcements posted by Administrators.
> - Shows the count of new announcements for today.
> - New announcements are visually highlighted.
>
> Include a screenshot.

---

## 6.0 NOTIFICATIONS SYSTEM

> **[WHAT TO WRITE HERE]**
> Explain how the notifications system works across all roles:

### 6.1 How Real-Time Notifications Work

> - The system checks all active units every **1 second** via polling.
> - Units with status **"In Progress"** or **"No Good (NG)"** are checked against their station's delay threshold.
> - If the time elapsed since the unit's last status update meets or exceeds the threshold, an alert is generated.
> - Two alert types:
>   - **⚠️ Unit Delay Alert** — Unit stayed at a station too long.
>   - **🚨 Quality Alert (NG)** — A defective unit exceeded the allowed time at its station.
> - Alerts appear in the bell icon for both Admins and IT Assistants.
> - Clicking an alert navigates directly to the affected station and highlights the specific unit.

### 6.2 Delay Threshold Configuration

> - Thresholds are set per station by the Administrator in **Settings → Configure Thresholds**.
> - Default thresholds (in minutes):

| Station | Process Name | Default Threshold (min) |
|---------|-------------|-------------------------|
| Station 1 | PCB Pairing | 6 |
| Station 2 | Integrated Board Test | 8 |
| Station 3 | Main Board Conformal Coating | 3 |
| Station 4 | RTV Application | 12 |
| Station 5 | Casing/Harnessing | 15 |
| Station 6 | Complete Unit Test/Calibration | 15 |
| Station 7 | Pre BI Hi-Pot Test | 3 |
| Station 8 | Burn-in Testing | 15 |
| Station 9 | Sealing | 480 |
| Station 10 | Post BI Hi-Pot Test | 8 |
| Station 11 | Final Functional/Connectivity Test | 22 |
| Station 12 | Label Sticker Attachment | 5 |
| Station 13 | FVI | 10 |
| Station 14 | Packing | 8 |
| Station 15 | QC Stamping | 5 |

> - Changes made in Settings apply immediately to all users without requiring a page reload.

---

## 7.0 TROUBLESHOOTING

### 7.1 Login Issues

> **[WHAT TO WRITE HERE]**
> List common login problems and solutions:

| Problem | Possible Cause | Solution |
|---------|---------------|----------|
| "Invalid username or password" | Incorrect credentials | Double-check your username and password. Passwords are case-sensitive. |
| Page won't load | Apache or MySQL not running | Open XAMPP Control Panel and start Apache and MySQL. |
| Redirected back to login | Session expired | Log in again. |
| Logged in as wrong role | Shared device | Log out and log in with the correct account. |

### 7.2 Data Not Loading

> **[WHAT TO WRITE HERE]**

| Problem | Possible Cause | Solution |
|---------|---------------|----------|
| Dashboard shows empty/no units | Database is empty or API failed | Check if XAMPP MySQL is running. Verify the database has data. |
| Units not updating in real-time | Network issue | Refresh the page. Check your browser console for API errors. |
| Charts not showing | Browser compatibility | Use Chrome or Edge. Clear browser cache (Ctrl+Shift+R). |

### 7.3 Common Error Messages

> **[WHAT TO WRITE HERE]**
> List any error messages your system shows and what the user should do:

| Error Message | What It Means | What to Do |
|---------------|---------------|------------|
| "Failed to fetch data" | Backend API is unreachable | Make sure Apache is running in XAMPP. |
| "Save failed. Check console." | Unit update failed | Check if the database is online. Refresh and try again. |
| "Invalid PIN" | Wrong shipment PIN entered | Enter the correct PIN or contact the Administrator. |
| "Only Administrators can post announcements." | Role restriction | Log in as Administrator to post announcements. |
| "Failed to approve unit" | Server or network error | Refresh the page and try again. |

---

## 8.0 SYSTEM ADMINISTRATION REFERENCE

> **[NOTE]** This chapter is for technical reference. Include it if your professor requires it.
> You can remove this chapter if the manual is intended for end users only.

### 8.1 Database Overview

> **[WHAT TO WRITE HERE]**
> Briefly describe the database:
> - Database name: `mkff` (MySQL)
> - Main tables and their purpose:

| Table | Purpose |
|-------|---------|
| `users` | Stores all system users (username, password, role, station, avatar) |
| `units` | Stores all production units and their current status/station |
| `unit_history` | Stores all status change history for every unit |
| `daily_reports` | Stores reports submitted by operators |
| `announcements` | Stores announcements posted by administrators |
| `inventory` | Stores inventory items |
| `target_times` | Stores per-station delay thresholds |

### 8.2 API Endpoints Summary

> **[WHAT TO WRITE HERE]**
> List the backend API endpoints:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/login.php` | POST | Authenticate a user |
| `/api/units.php` | GET | Fetch all units |
| `/api/units.php?method=PUT` | POST | Update a unit |
| `/api/unit_history.php` | GET | Fetch unit history logs |
| `/api/daily_reports.php` | GET | Fetch all reports |
| `/api/user_management.php` | GET | Fetch all users |
| `/api/user_management.php` | POST | Add/edit a user |
| `/api/announcements.php` | GET | Fetch announcements |
| `/api/announcements.php` | POST | Post an announcement |
| `/api/announcements.php` | DELETE | Delete an announcement |
| `/api/inventory.php` | GET | Fetch inventory list |
| `/api/target_times.php` | GET/POST | Fetch or update station thresholds |

### 8.3 User Role Permissions Matrix

> **[WHAT TO WRITE HERE]**
> Create a permissions table:

| Feature | Administrator | IT Assistant | Operator |
|---------|:---:|:---:|:---:|
| View Dashboard | ✅ | ✅ | ✅ |
| View All Stations | ✅ | ✅ | ❌ |
| View Own Station | ✅ | ✅ | ✅ |
| Generate QR Codes | ❌ | ✅ | ❌ |
| Scan / Enter Units | ❌ | ❌ | ✅ |
| Edit Any Unit | ✅ | ❌ | ✅ (own station) |
| Approve Units | ✅ | ✅ | ❌ |
| Submit Daily Report | ❌ | ❌ | ✅ |
| View Reports | ✅ | ✅ | ❌ |
| Post Announcements | ✅ | ❌ | ❌ |
| Read Announcements | ✅ | ✅ | ✅ |
| Manage Users | ✅ | ❌ | ❌ |
| Dispatch Shipment | ✅ | ❌ | ❌ |
| Configure Thresholds | ✅ | ❌ | ❌ |
| Manage Release PIN | ✅ | ❌ | ❌ |
| View Notifications | ✅ | ✅ | ✅ |

---

*End of User Manual*

---

> **📌 REMINDER FOR YOUR GROUP:**
> - Replace all `[WHAT TO WRITE HERE]` blocks with actual text describing your system.
> - Add screenshots to every section — your professor will likely require them.
> - Remove the `> **[...]**` quote blocks before submitting; those are just your writing guides.
> - Fill in the cover page info (Group Name, Professor's Name, Course) at the top.
> - You can convert this `.md` file to a Word document or PDF for final submission.
