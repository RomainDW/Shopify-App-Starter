import { Card, Button, Page } from "@shopify/polaris";

class Index extends React.Component {
  constructor(props) {
    super(props);

    this.createLiquidTemplate = this.createLiquidTemplate.bind(this);
  }

  createLiquidTemplate() {
    const fetchUrl = "/api/products";
    const method = "GET";

    fetch(fetchUrl, {
      method: method
    })
      .then(response => response.json())
      .then(json => console.log(json));
  }

  render() {
    return (
      <Page>
        <Card title="Test" sectioned>
          <Button primary loading={false} onClick={this.createLiquidTemplate}>
            Créer le template
          </Button>
        </Card>
      </Page>
    );
  }
}

export default Index;
