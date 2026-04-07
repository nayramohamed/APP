export interface ISlideData {
  imageUrl: string;
  title: string;
  description: string;
  firstButtonText: IButtonData;
  secondButtonText: IButtonData;
}


interface IButtonData {
  text: string;
  action?: string;
}