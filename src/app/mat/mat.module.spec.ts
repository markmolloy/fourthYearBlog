import { MatModule } from './mat.module';

describe('MatModule', () => {
  let matModule: MatModule;

  beforeEach(() => {
    matModule = new MatModule();
  });

  it('should create an instance', () => {
    expect(matModule).toBeTruthy();
  });
});
