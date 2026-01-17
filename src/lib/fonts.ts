import localFont from "next/font/local";

export const futura = localFont({
  src: [
    {
      path: '../../public/fonts/FuturaCyrillicBold.ttf',
      weight: '700',
      style: 'bold'
    },
    {
      path: '../../public/fonts/FuturaCyrillicBook.ttf',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/FuturaCyrillicDemi.ttf',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../../public/fonts/FuturaCyrillicExtraBold.ttf',
      weight: '900',
      style: 'bold',
    },
    {
      path: '../../public/fonts/FuturaCyrillicHeavy.ttf',
      weight: '750',
      style: 'bold',
    },
    {
      path: '../../public/fonts/FuturaCyrillicLight.ttf',
      weight: '750',
      style: 'normal',
    },
    {
      path: '../../public/fonts/FuturaCyrillicMedium.ttf',
      weight: '500',
      style: 'normal',
    },
  ],
});
