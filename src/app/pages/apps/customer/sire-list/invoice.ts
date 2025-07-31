
export class InvoiceLine {
  constructor(
    public ID: string = '',
    public Description: string = '',
    public Quantity: number = 0,
    public UnitPrice: number = 0,
    public LineExtensionAmount: number = 0
  ) { }
}

export class Supplier {
  constructor(
    public ID: string = '', // RUC
    public Name: string = ''
  ) { }
}

export class Customer {
  constructor(
    public ID: string = '', // RUC
    public Name: string = ''
  ) { }
}

export class TaxTotal {
  constructor(
    public TaxAmount: number = 0
  ) { }
}

export class LegalMonetaryTotal {
  constructor(
    public PayableAmount: number = 0
  ) { }
}

export class Invoice {
  constructor(
    public ID: string = '',
    public IssueDate: Date = new Date(),
    public Supplier: Supplier = { ID: '', Name: '' }, // ✅ OK con interfaz
    public Customer: Customer = { ID: '', Name: '' },
    public InvoiceLines: InvoiceLine[] = [],
    public TaxTotal: TaxTotal = { TaxAmount: 0 },
    public LegalMonetaryTotal: LegalMonetaryTotal = { PayableAmount: 0 },
    public status: string = '' // Estado adicional personalizado
  ) { }
}
