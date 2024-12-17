import { PrismaClient } from "@prisma/client";


class PrismaSingleton {
    constructor() {
      if (PrismaSingleton.instance) {
        return PrismaSingleton.instance; 
      }
      PrismaSingleton.instance = this;
      this.client = new PrismaClient();
    }
}

export default PrismaSingleton;