# Introduction
Search Crawler to github by URL and keyword.

# Run
## 1. Usage
``` javascript
new Crawler({url}, {keyword})
```

## 2. Example
``` javascript
import Crawler from './crawler';
let url = 'https://github.com/LeeHyungGeun/react-tutorial/';
let crawler = new Crawler(url, '8080');
```

# Todo
- Store result on MongoDB
- OAuth2 by Github