export const ROW_CONTEXT_TABLE_HTML_SNIPPET = `  <div class="table-responsive">
      <table mat-table [dataSource]="data" class="w-100">
        <!-- Index Column -->
        <ng-container matColumnDef="$implicit">
          <th mat-header-cell *matHeaderCellDef class="f-w-600 mat-subtitle-1 f-s-14 p-l-0">
            $implicit
          </th>
          <td mat-cell *matCellDef="let data" class="p-l-0">{{ data }}</td>
        </ng-container>

        <!-- Index Column -->
        <ng-container matColumnDef="index">
          <th mat-header-cell *matHeaderCellDef class="f-w-600 mat-subtitle-1 f-s-14">
            index
          </th>
          <td mat-cell *matCellDef="let index = index">{{ index }}</td>
        </ng-container>

        <!-- Index Column -->
        <ng-container matColumnDef="count">
          <th mat-header-cell *matHeaderCellDef class="f-w-600 mat-subtitle-1 f-s-14">
            count
          </th>
          <td mat-cell *matCellDef="let count = count">{{ count }}</td>
        </ng-container>

        <!-- Index Column -->
        <ng-container matColumnDef="first">
          <th mat-header-cell *matHeaderCellDef class="f-w-600 mat-subtitle-1 f-s-14">
            first
          </th>
          <td mat-cell *matCellDef="let first = first">{{ first }}</td>
        </ng-container>

        <!-- Index Column -->
        <ng-container matColumnDef="last">
          <th mat-header-cell *matHeaderCellDef class="f-w-600 mat-subtitle-1 f-s-14">
            last
          </th>
          <td mat-cell *matCellDef="let last = last">{{ last }}</td>
        </ng-container>

        <!-- Index Column -->
        <ng-container matColumnDef="even">
          <th mat-header-cell *matHeaderCellDef class="f-w-600 mat-subtitle-1 f-s-14">
            even
          </th>
          <td mat-cell *matCellDef="let even = even">{{ even }}</td>
        </ng-container>

        <!-- Index Column -->
        <ng-container matColumnDef="odd">
          <th mat-header-cell *matHeaderCellDef class="f-w-600 mat-subtitle-1 f-s-14">
            odd
          </th>
          <td mat-cell *matCellDef="let odd = odd">{{ odd }}</td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns"></tr>
      </table>
    </div>
`;