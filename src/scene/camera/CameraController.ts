import { PovRequest } from "@/scene/camera/PovCamera";

export interface CameraController {
  moveToSeat(request: PovRequest): void;
  reset(): void;
  isAnimating(): boolean;
}

export class DefaultCameraController implements CameraController {
  private animating: boolean = false;

  async moveToSeat(request: PovRequest): Promise<void> {
    this.animating = true;
    await new Promise((resolve) => setTimeout(resolve, 500));
    this.animating = false;
  }

  reset(): void {
    this.animating = false;
  }

  isAnimating(): boolean {
    return this.animating;
  }
}
