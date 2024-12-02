# OSC-Vimix-UI
User Interface meant to be used with Bruno Herbelin's wonderful <a href="https://github.com/brunoherbelin/vimix">Vimix: Live Video Mixer</a>.
Built with the equally great <a href="https://openstagecontrol.ammd.net/">Open Stage Control - Libre and modular OSC / MIDI controller</a>.
For more information and Video tutorials on both these applications please have a look at the <a href="https://www.youtube.com/playlist?list=PLEky5KQSvdTiofKvdcbXkwmPlWi-lTPpT">youtube playlist</a>. Part 11 is about this template.

PLEASE BE AWARE that this template is still WIP.
Known failures at the moment:
- connecting clients from different devices does not automatically load the client.json. Either load the file manually on your device via the O-S-C toolbar or wait a few days until this is fixed
- snycing is messed up when connecting to clients -> same reason as above

# Basic Setup
- download the .zip file
- extract the content of the .zip file to your Vimix project folder
- start OpenStageControl with "OSC_UI.json" and "OSC_module.js" as startup files
- go to "SETTINGS" tab of the UI and copy/paste the path to your Vimix project folder (actually the same folder to where you copied the .zip file to) into the input field. Press ENTER to make changes work in text-input-fields!
- go to the "MIX" tab and from the dropdown menu on top right choose one of your Vimix project files (.mix files) to load

# Naming Conventions

State files
To save the states of certain tabs go to the ".../OSC_savedStates" folder and create a file with the name of your currently open .mix project. Replace ".mix" with ".state". Open it once and type two curly brackets {} into it. Save the file
Example: the Vimix project you are working on is called "myVimixProject.mix" -> create the file .../OSC_savedStates/myVimixProject.state with two curly brackets in it as content

Thumbnails
You can collect thumbnails of your sources for better visual reference in the UI - especially when working with Vimix's headless feature.
Your thumbnails have to be ".png" file format and must be saved in the folder ".../OSC_assets/thumbnails". 
For them to be detected by the template give them names like this:

1. Single Sources
    VimixSessionName_IndexOfSourceInVimix.png
    VimixSessionName = without ".mix" suffix
    IndexOfSourceInVimix = Index+1
    Example: If your Vimix session is called "MyVimixSession.mix" and it contains 4 sources
    then the according thumbnails must be named:
        MyVimixSession_1.png
        MyVimixSession_2.png
        MyVimixSession_3.png
        MyVimixSession_4.png


2. Batches
    VimixSessionName_B-IndexOfBatchInVimix.png
    VimixSessionName = without ".mix" suffix
    IndexOfBatchInVimix = Index+1
    Example: If your Vimix session is called "MyVimixSession.mix" and it you created 3 batches in it
    then the according thumbnails must be named:
        MyVimixSession_B-1.png
        MyVimixSession_B-2.png
        MyVimixSession_B-3.png
        MyVimixSession_B-4.png
