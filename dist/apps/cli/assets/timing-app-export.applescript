-- Copyright (c) 2023 Timing Software GmbH. All rights reserved.
-- This script is licensed only to extend the functionality of Timing. Redistribution and any other uses are not allowed without prior permission from us.
tell application "TimingHelper"
	if not advanced scripting support available then
		error "This script requires a Timing Connect subscription. Please contact support via https://timingapp.com/contact to upgrade."
	end if
end tell
set startdate to date "START_DATE"
set enddate to date "END_DATE"

tell application "TimingHelper"
	set reportSettings to make report settings
	set exportSettings to make export settings

	get properties of reportSettings

	tell reportSettings
		set first grouping mode to by month
		set second grouping mode to by project

		set time entries included to true
		set time entry title included to true
		set also group by time entry title to true
		set time entry timespan included to true
		set time entry notes included to true

		set app usage included to true
		set application info included to true
		set timespan info included to true

		set title info included to true
		set path info included to true

		set also group by application to true
	end tell

	tell exportSettings
		set file format to JSON

		set duration format to seconds

		set short entries included to true
	end tell

	save report with report settings reportSettings export settings exportSettings between startdate and enddate to "EXPORT_PATH"

	-- these commands are required to avoid accumulating old settings (and thus leaking memory)
	delete reportSettings
	delete exportSettings
end tell
