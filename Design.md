# Overall design

## src
- the typescript source files
- these are compiled by typescript into javascript files in the 'build' folder

## main and render
- 'Main' and 'Render' follow Electron's [context isolation model](https://www.electronjs.org/docs/latest/tutorial/process-model) for security purposes
- 'Main' runs in a nodejs environment
- 'Render' renders the web content and does not have access to node

## render
- contains use cases, models, state and utilities
- the 'Use cases' folder represents what the app is used for 
- files in the 'Models' folder contain methods for setting and  accessing data (either in persistent database storage or constructed for the app's purposes)
- files in the 'State' folder contain variables that hold current state, with setters and accessors
- files in the 'Utils' folder contain utilities that are used by various files in the app

## views and presenters
- concerns are separated using a very simplistic version of a View-Interactor-Presenter design where Interactor and Presenter are combined into one presenter file
- views render the view and deal with user interaction
- presenters interact with the data model and return view models to the view for display purposes
- a view should not interact with anything in models, but should request the presenter to provide the view model it needs
- this has not been strictly observed (maybe in a future refactor?) 

## build
- typescript compiles the typescript files into javascript files which are located in the build folder
- the build folder contains all the files that are used when running the app locally (`yarn start`)
- therefore it contains files that are not in the src folders such as index.html, css and images and so the build folder should not be deleted