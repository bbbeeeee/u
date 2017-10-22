import Jimp from 'jimp';
import axios from 'axios';

const randomOrgBaseUrl = 'https://www.random.org';
const MAX_INTEGERS = 10000;
const BMP_DIMENSION = 128;
var fs = require('fs');

// Retrieves any number of random numbers from random.org
// Recursively retrieves if over 10000 (max for integer endpoint)
const getRandomNumbers = (num=1, min=0, max=100, col=1, base=10, rnd='new', format='plain', nums=[]) => {
  return axios.get(`${randomOrgBaseUrl}/integers`, {
    params: {
      num: (num > MAX_INTEGERS) ? MAX_INTEGERS : num,
      min,
      max,
      col,
      base,
      rnd,
      format
    }
  }).then(response => {
    num -= (num > MAX_INTEGERS) ? MAX_INTEGERS : num;
    let newNums = response.data.split('\n');
    newNums.pop();
    nums = nums.concat(newNums);

    if(num > 0) {
      return getRandomNumbers(
        num,
        min,
        max,
        col,
        base,
        rnd,
        format,
        nums
      );
    } else {
      return nums;
    }
  }).catch(err => {
    console.log(err);
  });
}

// Creates bitmap from random integers into filename
const createRandomBitmap = (filename) => {
  // 3 * pixel number for RGB values for each.
  return getRandomNumbers(
    BMP_DIMENSION * BMP_DIMENSION * 3,
    1,
    255
  ).then(nums => {
    if(!nums) return null;

    // with enough random values for RGB for each pixel, make image
    let image = new Jimp(BMP_DIMENSION, BMP_DIMENSION, (err, image) => {
      for(let i = 0; i < BMP_DIMENSION; i++) {
        for(let j = 0; j < BMP_DIMENSION* 3; j += 3) {
          image.setPixelColor(
            // generate hex value from decimals from random.org
            Jimp.rgbaToInt(
              parseInt(nums[i * BMP_DIMENSION + j]),
              parseInt(nums[i * BMP_DIMENSION + j + 1]),
              parseInt(nums[i * BMP_DIMENSION + j + 2]),
              1
            ),
            i,
            Math.floor(j / 3)
          )
        }
      }
    })

    image.write(filename);

    return true;
  })
}

createRandomBitmap('128.bmp');
