#!/usr/bin/osascript
on new_window()
	tell application "iTerm" to create window with default profile
end new_window

on new_tab()
	tell application "iTerm" to tell the first window to create tab with default profile
end new_tab

on call_forward()
	tell application "iTerm" to activate
end call_forward

on is_running()
	application "iTerm" is running
end is_running

on is_processing()
	tell application "iTerm" to tell the first window to tell current session to get is processing
end is_processing

on has_windows()
	if not is_running() then return false
	if windows of application "iTerm" is {} then return false
	true
end has_windows

on send_text(custom_text)
	tell application "iTerm" to tell the first window to tell current session to write text custom_text
end send_text

-- Main
on run argv
	if has_windows() then
		new_window()
	else
		-- If iTerm is not running and we tell it to create a new window, we get two
		-- One from opening the application, and the other from the command
		if is_running() then
			new_window()
		else
			call_forward()
		end if
	end if

	-- Make sure a window exists before we continue, or the write may fail
	repeat until has_windows()
		delay 0.01
	end repeat

	tell application "System Events"
		tell application process "iTerm2"
			set frontmost to true
		end tell
	end tell

	send_text("/Applications/MacUpdater.app/Contents/Resources/macupdater_client scan; /Applications/MacUpdater.app/Contents/Resources/macupdater_client update; topgrade")
	call_forward()
end run
