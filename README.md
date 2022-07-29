![Asset_Tracker banner](https://user-images.githubusercontent.com/86822695/181797785-3acb6616-7d80-496a-b13c-c2e70e92ce7e.png)
# Asset Tracker Website 
![Stars](https://img.shields.io/ore/stars/stars)


Asset Tracker helps you track all your financial assets. In this website, the users will get live day to day 
update of their stocks as well as they can track their personal 
assets. The website provide you with all necessary information 
regarding your assets like their percentage gain/loss and your total 
savings. 

### Live Demo:
https://fierce-citadel-85684.herokuapp.com/

![ezgif com-gif-maker](https://user-images.githubusercontent.com/86822695/181792503-20c1b6fb-f490-4758-8057-a0a16a83403a.gif)

### Technologies Used

<a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript" target="_blank" rel="noreferrer"> <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/javascript/javascript-original.svg" alt="javascript" width="30" height="30"/> </a>  &emsp;   <a href="https://www.w3.org/html/" target="_blank" rel="noreferrer"> <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/html5/html5-original-wordmark.svg" alt="html5" width="30" height="30"/> </a>  &emsp;   <a href="https://www.w3schools.com/css/" target="_blank" rel="noreferrer"> <img src="https://raw.githubusercontent.com/devicons/devicon/master/icons/css3/css3-original-wordmark.svg" alt="css3" width="30" height="30"/> </a> 
 
## Features

- Live update every 24 hours
- Graphical representation using charts
- Authentication and secure datas
- Local assets with update price feature
- Cross platform

## How To Use And Features Available
 
#### Track your NASDAQ (USA) and NSE (India) stocks

You can get live price as well as you can customise with your own price.

![nasdaq asset gif](https://user-images.githubusercontent.com/86822695/181798025-e962e537-dddb-46c9-9dd7-f6c174a54a95.gif)

#### Add custom assets and update price

You can add your  custom assets like gold, real estates and will be able 
to update their current price.

![custom asset gif](https://user-images.githubusercontent.com/86822695/181798079-5c4a4643-5242-4c20-8b26-4e4cb7f18d69.gif)

#### Graphical representation

Users will get graphical representation using different charts. 
Pie chart: ALlocations of assets in your portfolio
Bar chart: Invested amount vs Current value

![graphical representation](https://user-images.githubusercontent.com/86822695/181798126-380f839f-f97b-46ca-a103-3527c2c8a0a6.gif)

## API Reference

#### Get company symbols of stocks

```https://financialmodelingprep.com
  GET /api/v3/search?query=${companyName}&limit=10&exchange=NASDAQ&apikey=${apiKey}
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `apiKey` | `string` | **Required**. Your API key |
| `companyName` | `string` | **Required**. Search company Name |

#### Get stock price of the stock.

```https://www.alphavantage.co
  GET /query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${apiKey}
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `apiKey` | `string` | **Required**. Your API key |
| `symbol` | `string` | **Required**. Search using company symbol |










