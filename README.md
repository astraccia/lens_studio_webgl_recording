# Update the code with your lens IDs:

1. Go to file `src/main.js` and change the lines:

```
const apiToken = "YOUR_API_TOKEN";
```

Update YOUR_API_TOKEN with your Lens Studio CameraKit API Token

```
const lens = await cameraKit.lensRepository.loadLens('your lens ID','your lens folder ID');
```

Update the lens ID and the lens folder ID with the new lens ID and the new lens folder ID.



# To build the project:

Go to the main folder and run the following command to install all the dependencies for the project:

```
npm i
```


To run the project locally:

```
npm start
```

To build the project for publishing:

```
npm run build
```

It will build the project in the folder `app`. Simply upload the files in the `app` folder to your web server.
Important: your webserver should have a SSL certificate (https) in order to run the webApp



