export {};

declare global {
  /**
   * Now declare things that go in the global namespace,
   * or augment existing declarations in the global namespace.
   */
    interface Order {
        name: string;
        address: string;
        amount: string;
    }

    interface KitsuneOrder {
        sellToken: string; 
        spender: string;
        swapCallData: string;
        sellAmount: number;
    }

}