# profile-loader
Delete the specified code according to the profile

构建时根据profile，删除掉指定代码，从而可以用来打出不同的包

# Guide 使用指南 
Install
```cmd
npm install profile-loader
```

In webpack config
```js
            {
                test: /\.(vue|js)$/,
                use: {
                    loader: "profile-loader",
                    options: {
                        profile: "profile1" // or profile2,profile3...
                    }
                }
            }
```

In source code
```css
/*include profile1 profile2 start*/
background-image: url("../assets/image/banner.png");  /* If profile is not profile1 or profile2, this line would be removed */
/*include end*/
/*exclude profile2 profile3 start*/
background-image: url("../assets/image/banner_1.png"); /* If profile is profile2 or profile3, this line would be removed */
/*exclude end*/
```
