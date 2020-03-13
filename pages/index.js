import { Page, TextStyle, Layout, CalloutCard, Banner } from "@shopify/polaris";

class Index extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      themeId: "",
      loading: false,
      created: false
    };

    this.createLiquidTemplate = this.createLiquidTemplate.bind(this);
    this.setThemeId = this.setThemeId.bind(this);

    this.setThemeId();
  }

  setThemeId() {
    const fetchUrl = "/api/themes";
    const method = "GET";

    fetch(fetchUrl, {
      method: method
    })
      .then(response => response.json())
      .then(json => {
        json.data.themes.map(theme => {
          if (theme.role == "main") {
            this.setState({ themeId: theme.id });
          }
        });
      })
      .catch(error => {
        console.log(
          "Il y a eu un problème avec l'opération fetch: " + error.message
        );
      });
  }

  createLiquidTemplate() {
    const themeId = this.state.themeId;
    const fetchUrl = `/create-asset/${themeId}`;
    const method = "PUT";

    this.setState({ loading: true });
    console.log(this.state.loading);

    fetch(fetchUrl, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json"
      },
      method: method,
      body: JSON.stringify({ themeId, value: "<div>test</div>" })
    })
      .then(() => {
        this.setState({ loading: false });
        this.setState({ created: true });
      })
      .catch(e => console.log(e));
  }

  test() {
    console.log("test2");
  }

  render() {
    return (
      <Page>
        <Layout>
          <Layout.Section>
            {this.state.created && (
              <Banner title="Le template a été ajouté !" status="success" />
            )}
          </Layout.Section>

          <Layout.Section primary>
            <CalloutCard
              title="Ajouter un template pour partager votre panier"
              illustration="https://cdn.shopify.com/s/assets/admin/checkout/settings-customizecart-705f57c725ac05be5a34ec20c05b94298cb8afd10aac7bd9c7ad02030f48cfa0.svg"
              primaryAction={{
                content: "Customize checkout",
                onAction: () => {
                  this.createLiquidTemplate();
                },
                disabled: this.state.themeId ? false : true,
                loading: this.state.loading ? true : false,
                primary: true
              }}
            >
              <p>
                Une fois que le template est créé, copiez cet extrait de code
                :&nbsp;
                <TextStyle variation="code">
                  &#123;&#123;include test.liquid&#125;&#125;
                </TextStyle>
                &nbsp; et mettez le dans votre layer panier.
              </p>
            </CalloutCard>
          </Layout.Section>
        </Layout>
      </Page>
    );
  }
}

export default Index;
