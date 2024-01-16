const htmlContent = `html
<!DOCTYPE html>
<html>
<head>
<style>
table {
  font-family: Arial, sans-serif;
  border-collapse: collapse;
  width: 100%;
}

td, th {
  border: 1px solid #dddddd;
  text-align: left;
  padding: 8px;
}

tr:nth-child(even) {
  background-color: #f2f2f2;
}
</style>
</head>
<body>

<h2>Estimate</h2>
<p>This table provides a breakdown of the costs associated with a site visit and the completion of a Fire Risk Assessment and Fire Safety Plan for the DRAX Smithers project. The total cost for these services is indicated as CA$9,500.00.</p>

<table>
  <tr>
    <th>Name</th>
    <th>Price</th>
    <th>Quantity</th>
    <th>Subtotal</th>
  </tr>
  <tr>
    <td>DRAX Smithers Site Visit</td>
    <td>CA$3,000.00</td>
    <td>1</td>
    <td>CA$3,000.00</td>
  </tr>
  <tr>
    <td>Fire Risk Assessment and Fire Safety Plan completion</td>
    <td>CA$6,500.00</td>
    <td>1</td>
    <td>CA$6,500.00</td>
  </tr>
  <tr>
    <td colspan="3">Total:</td>
    <td>CA$9,500.00</td>
  </tr>
</table>

</body>
</html>`;
const complexRegex = /(```[\s\S]*?```)|(\n)|(^>>>.*$)|(^#!.*$)|(^\|.*?\|$(?:\n^\|.*?\|$)*)|(<table>[\s\S]*?<\/table>)|(<body>[\s\S]*?<\/body>)/gm;

//const matches = htmlContent.match(complexRegex);

const elements = htmlContent.split(complexRegex).map((fragment, index) => {
    if (!fragment ) return null;

    const isUserPrompt = fragment.startsWith('You:');
    const isCodeBlock = fragment.startsWith('>>>') || fragment.startsWith('#!');
    const isBacktickCode = fragment.startsWith('```') && fragment.endsWith('```');
    const isNewLine = fragment === '\n';
    //const isLog = dateTimeRegex.test(fragment);
    const isTable = fragment.trim().startsWith('|') && fragment.trim().endsWith('|');
    const isHTMLTable = (fragment.trim().startsWith('<table>') && fragment.trim().endsWith('</table>')) || (fragment.trim().startsWith('<body>') && fragment.trim().endsWith('</body>'));
    if(isHTMLTable) console.log("fragment: ", fragment);
});
