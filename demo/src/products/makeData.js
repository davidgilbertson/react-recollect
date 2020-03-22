const PRODUCT_COUNT = 103;

const lorems = [
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris sem tellus, sagittis ac est' +
    ' ac, faucibus finibus mi. Donec scelerisque nibh nibh, accumsan feugiat elit gravida ut. Etiam a condimentum ex. Nunc feugiat varius rhoncus. Proin molestie sollicitudin eros pharetra euismod. Morbi nec dignissim ex, eu egestas quam. Nunc molestie molestie laoreet. Nam metus leo, auctor non sem id, lobortis blandit nisl. Nulla non neque quis elit consectetur vulputate ultrices vel arcu.',
  'Donec ac dignissim lacus. Nulla egestas et ligula vitae tristique. Duis viverra mattis nisi, in vulputate magna consectetur at. Praesent hendrerit nulla eget ante luctus hendrerit. Donec id consequat nibh. Duis at lorem arcu. Mauris iaculis est tortor, sed rutrum eros congue sit amet. Integer fringilla mauris est, at condimentum massa finibus sed. Suspendisse potenti.',
  'Pellentesque et purus lacus. Mauris lobortis quam nec aliquet hendrerit. Mauris lacus erat, aliquam ac augue in, vulputate hendrerit nulla. Maecenas lobortis, arcu ac scelerisque laoreet, ligula sem aliquet turpis, quis tempus odio nulla tempor diam. Aenean ex nulla, ultrices tempus arcu at, pellentesque rhoncus mauris. In aliquam vel ex vel ultrices. Morbi posuere tincidunt vehicula. Ut interdum mauris ut rhoncus vulputate. Vivamus efficitur placerat sem, in elementum turpis eleifend non. Proin sit amet ipsum sit amet augue pretium blandit et non ex. Aenean lacus magna, volutpat id lacinia id, fermentum et velit. Aenean dignissim tortor sit amet volutpat venenatis. Nam dui est, fringilla vitae mollis sit amet, fermentum eget odio. Fusce efficitur luctus odio, ut bibendum lorem dignissim et.',
  'Curabitur vestibulum purus non mollis volutpat. Nunc lorem ex, porta ut vehicula ultricies, facilisis ac tellus. Quisque eu magna neque. Aliquam non justo faucibus, luctus odio at, pharetra massa. Mauris ultricies venenatis enim, pulvinar pharetra justo. Curabitur rutrum venenatis nunc. Suspendisse fringilla eu odio quis posuere. Curabitur semper ligula ac facilisis consectetur. Fusce bibendum consectetur vehicula. Mauris tellus mauris, iaculis volutpat tortor in, molestie iaculis ipsum. Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  'Nullam euismod nulla sed congue sagittis. Integer ac imperdiet arcu, laoreet sagittis justo. Vestibulum vestibulum velit sit amet nulla lacinia, at viverra libero malesuada. Vestibulum vitae eleifend nibh. Suspendisse nunc purus, vulputate in scelerisque ut, accumsan id lacus. Ut quis nulla nulla. Fusce efficitur turpis nunc, ut auctor ipsum iaculis vitae. Maecenas volutpat nisi vel elit vulputate, iaculis elementum diam pulvinar. Cras sit amet porttitor lectus. Quisque faucibus mollis orci vitae iaculis. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos.',
];

const productCategory = [
  'abstract',
  'animals',
  'business',
  'cats',
  'city',
  'food',
  'nightlife',
  'fashion',
  'people',
  'nature',
  'sports',
  'technics',
  'transport',
];

const A = [
  'Pretty',
  'Large',
  'Big',
  'Small',
  'Tall',
  'Short',
  'Long',
  'Handsome',
  'Plain',
  'Quaint',
  'Clean',
  'Elegant',
  'Easy',
  'Angry',
  'Crazy',
  'Helpful',
  'Mushy',
  'Odd',
  'Unsightly',
  'Adorable',
  'Important',
  'Inexpensive',
  'Cheap',
  'Expensive',
  'Fancy',
];
const C = [
  'red',
  'yellow',
  'blue',
  'green',
  'pink',
  'brown',
  'purple',
  'brown',
  'white',
  'black',
  'orange',
];
const N = [
  'table',
  'chair',
  'house',
  'bbq',
  'desk',
  'car',
  'pony',
  'cookie',
  'sandwich',
  'burger',
  'pizza',
  'mouse',
  'keyboard',
];

const pickOne = (arr) => arr[Math.floor(Math.random() * arr.length)];

const getFakeName = () => `${pickOne(A)} ${pickOne(C)} ${pickOne(N)}`;

const products = Array(PRODUCT_COUNT)
  .fill(null)
  .map((x, i) => ({
    id: i,
    name: getFakeName(),
    price: Math.random() * 1000,
    description: pickOne(lorems),
    category: pickOne(productCategory),
    date: new Date(Date.now() - Math.random() * 10000000000),
    favorite: Boolean(i % 2),
  }));

const makeData = () =>
  new Promise((resolve) => {
    setTimeout(() => {
      resolve(products);
    }, 100);
  });

export default makeData;
