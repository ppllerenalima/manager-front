export const TOP_PROJECT_TABLE_HTML_SNIPPET = `  <div class="table-responsive">
      <table mat-table [dataSource]="dataSource1" class="w-100">
        <!-- Position Column -->
        <ng-container matColumnDef="assigned">
          <th mat-header-cell *matHeaderCellDef class="f-w-600 mat-subtitle-1 f-s-14 p-l-0">
            Assigned
          </th>
          <td mat-cell *matCellDef="let element" class="p-l-0">
            <div class="d-flex align-items-center">
              <img [src]="element.imagePath" alt="users" width="40" class="rounded-circle" />
              <div class="m-l-16">
                <h6 class="mat-subtitle-1 f-s-14 f-w-600">
                  {{ element.uname }}
                </h6>
                <span class="f-s-14 f-s-12">
                  {{ element.position }}
                </span>
              </div>
            </div>
          </td>
        </ng-container>

        <!-- Name Column -->
        <ng-container matColumnDef="name">
          <th mat-header-cell *matHeaderCellDef class="f-w-600 mat-subtitle-1 f-s-14">
            Name
          </th>
          <td mat-cell *matCellDef="let element" class="f-s-14">
            {{ element.productName }}
          </td>
        </ng-container>

        <!-- Weight Column -->
        <ng-container matColumnDef="priority">
          <th mat-header-cell *matHeaderCellDef class="f-w-600 mat-subtitle-1 f-s-14">
            Priority
          </th>
          <td mat-cell *matCellDef="let element">
            @if(element.priority == 'low') {
            <span class="bg-light-secondary text-secondary rounded f-w-600 p-6 p-y-4 f-s-12">
              {{ element.priority | titlecase }}
            </span>
            } @if(element.priority == 'medium') {
            <span class="bg-light-primary text-primary rounded f-w-600 p-6 p-y-4 f-s-12">
              {{ element.priority | titlecase }}
            </span>
            } @if(element.priority == 'high') {
            <span class="bg-light-warning text-warning rounded f-w-600 p-6 p-y-4 f-s-12">
              {{ element.priority | titlecase }}
            </span>
            } @if(element.priority == 'critical') {
            <span class="bg-light-error text-error rounded f-w-600 p-6 p-y-4 f-s-12">
              {{ element.priority | titlecase }}
            </span>
            } @if(element.priority == 'moderate') {
            <span class="bg-light-success text-success rounded f-w-600 p-6 p-y-4 f-s-12">
              {{ element.priority | titlecase }}
            </span>
            }
          </td>
        </ng-container>

        <!-- Symbol Column -->
        <ng-container matColumnDef="budget">
          <th mat-header-cell *matHeaderCellDef class="f-w-600 mat-subtitle-1 f-s-14">
            Budget
          </th>
          <td mat-cell *matCellDef="let element" class="f-s-14">
            {{ element.budget }}k
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns1"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns1"></tr>
      </table>
    </div>
`;

export const BEST_PRODUCT_TABLE_HTML_SNIPPET = `  <div class="table-responsive">
      <table mat-table [dataSource]="dataSource2" class="w-100">
        <!-- Position Column -->
        <ng-container matColumnDef="product">
          <th mat-header-cell *matHeaderCellDef class="f-w-600 f-s-14 mat-subtitle-1 p-l-0">
            Product
          </th>
          <td mat-cell *matCellDef="let element" class="p-l-0">
            <div class="d-flex align-items-center">
              <img [src]="element.imagePath" alt="users" width="48" class="rounded" />
              <div class="m-l-16">
                <h6 class="f-s-14 mat-subtitle-1 f-w-600">
                  {{ element.pname }}
                </h6>
                <span class="f-s-14 f-s-12">
                  {{ element.category }}
                </span>
              </div>
            </div>
          </td>
        </ng-container>

        <!-- Name Column -->
        <ng-container matColumnDef="progress">
          <th mat-header-cell *matHeaderCellDef class="f-w-600 f-s-14 mat-subtitle-1">
            Progress
          </th>
          <td mat-cell *matCellDef="let element" class="f-s-14">
            {{ element.progress }}%
          </td>
        </ng-container>

        <!-- Weight Column -->
        <ng-container matColumnDef="status">
          <th mat-header-cell *matHeaderCellDef class="f-w-600 f-s-14 mat-subtitle-1">
            Status
          </th>
          <td mat-cell *matCellDef="let element">
            @if(element.status == 'low') {
            <span class="bg-light-success text-success rounded f-w-600 p-6 p-y-4 f-s-12">
              {{ element.status | titlecase }}
            </span>
            } @if(element.status == 'medium') {
            <span class="bg-light-warning text-warning rounded f-w-600 p-6 p-y-4 f-s-12">
              {{ element.status | titlecase }}
            </span>
            } @if(element.status == 'high') {
            <span class="bg-light-primary text-primary rounded f-w-600 p-6 p-y-4 f-s-12">
              {{ element.status | titlecase }}
            </span>
            } @if(element.status == 'critical') {
            <span class="bg-light-error text-error rounded f-w-600 p-6 p-y-4 f-s-12">
              {{ element.status | titlecase }}
            </span>
            }
          </td>
        </ng-container>

        <!-- Symbol Column -->
        <ng-container matColumnDef="sales">
          <th mat-header-cell *matHeaderCellDef class="f-w-600 f-s-14 mat-subtitle-1">
            Sales
          </th>
          <td mat-cell *matCellDef="let element" class="f-s-14">
            {{ element.sales }}k
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns2"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns2"></tr>
      </table>
    </div>
`;

export const PAYMENT_GATEWAYS_TABLE_HTML_SNIPPET = `  <div class="table-responsive">
      <table mat-table [dataSource]="dataSource3" class="w-100">
        <!-- Position Column -->
        <ng-container matColumnDef="product">
          <th mat-header-cell *matHeaderCellDef class="f-w-600 f-s-14 mat-subtitle-1 p-l-0">
            Product
          </th>
          <td mat-cell *matCellDef="let element" class="p-l-0">
            <div class="d-flex align-items-center">
              <span class="text-{{ element.color }} bg-light-{{
                  element.color
                }} rounded icon-40 d-flex align-items-center justify-content-center">
                <img [src]="element.imagePath" alt="icon" />
              </span>

              <div class="m-l-16">
                <h6 class="f-s-14 mat-subtitle-1 f-w-600">
                  {{ element.pname }}
                </h6>
                <span class="f-s-14 f-s-12">
                  {{ element.category }}
                </span>
              </div>
            </div>
          </td>
        </ng-container>

        <!-- Name Column -->
        <ng-container matColumnDef="price">
          <th mat-header-cell *matHeaderCellDef class="f-w-600 f-s-14 mat-subtitle-1 text-right">
            Price
          </th>
          <td mat-cell *matCellDef="let element" class="f-s-14 text-right">
            +{{ element.price }}
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns3"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns3"></tr>
      </table>
    </div>
`;

export const EMPLOYEE_THE_YEAR_TABLE_HTML_SNIPPET = `  <div class="table-responsive">
      <table mat-table [dataSource]="dataSource4" class="w-100">
        <ng-container matColumnDef="name">
          <th mat-header-cell *matHeaderCellDef class="f-w-600 f-s-16 mat-subtitle-1 p-l-0">
            Users
          </th>
          <td mat-cell *matCellDef="let element" class="p-l-0">
            <div class="d-flex align-items-center">
              <img [src]="element.imgSrc" alt="user" width="40" class="rounded-circle" />
              <div class="m-l-12">
                <h5 class="mat-subtitle-1 f-s-14 f-w-600 m-0">
                  {{ element.name }}
                </h5>
                <span class="f-s-12">{{ element.post }}</span>
              </div>
            </div>
          </td>
        </ng-container>

        <!-- Project Name Column -->
        <ng-container matColumnDef="pname">
          <th mat-header-cell *matHeaderCellDef class="f-w-600 f-s-16 mat-subtitle-1">
            Project Name
          </th>
          <td mat-cell *matCellDef="let element" class="f-s-14">
            {{ element.pname }}
          </td>
        </ng-container>

        <!-- Status Column -->
        <ng-container matColumnDef="status">
          <th mat-header-cell *matHeaderCellDef class="f-w-600 f-s-16 mat-subtitle-1">
            Status
          </th>
          <td mat-cell *matCellDef="let element">
            <span class="rounded-pill bg-light-{{ element.color }} text-{{
                element.color
              }} f-s-12 f-w-500 p-x-8 p-y-4">
              {{ element.status }}</span>
          </td>
        </ng-container>

        <!-- budget Column -->
        <ng-container matColumnDef="budget">
          <th mat-header-cell *matHeaderCellDef class="f-w-600 f-s-16 mat-subtitle-1 p-r-0 text-right">
            Budget
          </th>
          <td mat-cell *matCellDef="let element" class="f-w-500 text-right p-r-0">
            {{ element.budget }}k
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns4"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns4"></tr>
      </table>
    </div>
`;