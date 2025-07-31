import { Customer, Invoice, InvoiceLine, LegalMonetaryTotal, Supplier, TaxTotal } from "src/app/pages/apps/customer/sire-list/invoice";

interface InvoiceLineData {
    ID: string;
    Quantity: number;
    LineExtensionAmount: number;
    Description: string;
    UnitPrice: number;
}

interface InvoiceData {
    UBLVersionID?: string;
    CustomizationID: string;
    ID: string;
    IssueDate: string;
    DueDate: string;
    InvoiceTypeCode: string;
    DocumentCurrencyCode: string;
    SupplierName: string;
    SupplierID: string;
    CustomerName: string;
    CustomerID: string;
    TaxAmount: number;
    PayableAmount: number;
    InvoiceLines: InvoiceLineData[];
}


export class XmlParser {
  static parseInvoiceXML(xmlContent: string): Invoice {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlContent, 'text/xml');
    const nsResolver = XmlParser.nsResolver;

    const getValue = (xpath: string, contextNode: Node = xmlDoc): string | null => {
      const result = xmlDoc.evaluate(xpath, contextNode, nsResolver, XPathResult.STRING_TYPE, null);
      return result.stringValue || null;
    };

    const getNodes = (xpath: string): Element[] => {
      const result = xmlDoc.evaluate(xpath, xmlDoc, nsResolver, XPathResult.ORDERED_NODE_ITERATOR_TYPE, null);
      const nodes: Element[] = [];
      let node = result.iterateNext();
      while (node) {
        nodes.push(node as Element);
        node = result.iterateNext();
      }
      return nodes;
    };

    // Construcción de objetos anidados
    const supplier = new Supplier(
      getValue('//cac:AccountingSupplierParty/cac:Party/cac:PartyIdentification/cbc:ID')!,
      getValue('//cac:AccountingSupplierParty/cac:Party/cac:PartyName/cbc:Name')!
    );

    const customer = new Customer(
      getValue('//cac:AccountingCustomerParty/cac:Party/cac:PartyIdentification/cbc:ID')!,
      getValue('//cac:AccountingCustomerParty/cac:Party/cac:PartyName/cbc:Name')!
    );

    const taxTotal = new TaxTotal(
      parseFloat(getValue('//cac:TaxTotal/cbc:TaxAmount') || '0')
    );

    const monetaryTotal = new LegalMonetaryTotal(
      parseFloat(getValue('//cac:LegalMonetaryTotal/cbc:PayableAmount') || '0')
    );

    // Construcción de líneas de factura
    const invoiceLines: InvoiceLine[] = [];
    const lineNodes = getNodes('//cac:InvoiceLine');

    for (const lineNode of lineNodes) {
      const getLineValue = (xpath: string) => getValue(xpath, lineNode);

      const line = new InvoiceLine(
        getLineValue('cbc:ID')!,
        getLineValue('cac:Item/cbc:Description')!,
        parseFloat(getLineValue('cbc:InvoicedQuantity') || '0'),
        parseFloat(getLineValue('cac:Price/cbc:PriceAmount') || '0'),
        parseFloat(getLineValue('cbc:LineExtensionAmount') || '0')
      );

      invoiceLines.push(line);
    }

    // Crear y retornar el objeto Invoice
    const invoice = new Invoice(
      getValue('//cbc:ID')!,
      new Date(getValue('//cbc:IssueDate')!),
      supplier,
      customer,
      invoiceLines,
      taxTotal,
      monetaryTotal,
      '' // status puede ser asignado posteriormente
    );

    return invoice;
  }

  static nsResolver(prefix: string | null): string | null {
    switch (prefix) {
      case 'cbc':
        return 'urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2';
      case 'cac':
        return 'urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2';
      default:
        return null;
    }
  }
}
