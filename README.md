# Cycle Factory

Gantt charts of manufacturing cycles in a web app.


## Development

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 1.4.9.
The setup is further tweaked in the following way:
 - during devlopment: a local angular server runs in parallel of the vibe.d REST back-end
 - for production: vibe.d serves both the angular app and the REST back-end.

### Development server

Run `yarn serve:dev` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.
Rest API will run on the vibe.d server on `http://localhost:8080`

### Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

### Build

Run `yarn build:dev` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `yarn build:prod` flag for a production build.

### Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

### Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via [Protractor](http://www.protractortest.org/).
